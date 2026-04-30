# 04 | BLE 中心设备——扫描与设备发现

> 学完这篇，你能用 `BluetoothLeScanner` 高效找到目标设备，区分广播名称和本地名称，过滤掉垃圾广播，并控制扫描功耗不让用户手机发烫。

---

## 一、结论先行

BLE 扫描不是"打开收音机听所有频道"，而是**在 37/38/39 三个广播信道上按你设定的规则做定向监听**。Android 5.0+ 的 `BluetoothLeScanner` 把扫描拆成了三个可配置维度：

1. **扫描模式**（`ScanSettings`）：低延迟、均衡、低功耗三档，决定你的扫描 duty cycle
2. **过滤条件**（`ScanFilter`）：按服务 UUID、设备名称、MAC 地址等过滤，减少垃圾回调
3. **扫描结果处理**：同一个设备会重复上报，你需要去重和信号强度（RSSI）评估

**核心原则：扫描是 BLE 流程中最耗电的环节之一，目标是在最短时间内找到设备并停止扫描。**

---

## 二、ScanSettings：控制扫描的"雷达功率"

### 2.1 三种扫描模式

| 模式 | 常量 | duty cycle | 适用场景 |
|---|---|---|---|
| 低延迟 | `SCAN_MODE_LOW_LATENCY` | 100%（不间断） | 配对流程、用户主动触发 |
| 均衡 | `SCAN_MODE_BALANCED` | 约 50% | 常规搜索设备 |
| 低功耗 | `SCAN_MODE_LOW_POWER` | 约 10% | 后台持续扫描（如钥匙扣防丢） |

**底层原理**：蓝牙芯片不是持续监听三个信道，而是以一定占空比（duty cycle）周期性打开射频。低延迟模式芯片几乎不休息，所以耗电；低功耗模式射频大部分时间关闭，省电但可能漏掉广播。

### 2.2 两种回调模式

| 模式 | 常量 | 行为 |
|---|---|---|
| 回调所有结果 | `CALLBACK_TYPE_ALL_MATCHES` | 每收到一次广播就回调一次 |
| 回调首次匹配 | `CALLBACK_TYPE_FIRST_MATCH` | 设备第一次出现时回调，后续同设备不再回调 |

**什么时候用 FIRST_MATCH？** 当你只关心"某个设备是否在附近"，不需要持续跟踪 RSSI 变化（如门禁感应）。能大幅减少回调次数和 CPU 占用。

### 2.3 物理层过滤（Android 8+）

```kotlin
val settings = ScanSettings.Builder()
    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
    .setCallbackType(ScanSettings.CALLBACK_TYPE_ALL_MATCHES)
    .setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE)   // 匹配灵敏度：STRICT / AGGRESSIVE
    .setNumOfMatches(ScanSettings.MATCH_NUM_MAX_ADVERTISEMENT) // 最多缓存多少条匹配
    .build()
```

- `MATCH_MODE_STRICT`：只有 RSSI 较强（信号好）且数据匹配度高的才回调，减少噪声
- `MATCH_MODE_AGGRESSIVE`：只要匹配过滤条件就回调，灵敏度高但可能有干扰

---

## 三、ScanFilter：只看我关心的设备

### 3.1 常用过滤维度

```kotlin
// 1. 按服务 UUID 过滤（最常用）
val filterByService = ScanFilter.Builder()
    .setServiceUuid(ParcelUuid.fromString("0000180D-0000-1000-8000-00805F9B34FB"))
    .build()

// 2. 按设备名称过滤（注意：广播名称可能和系统名称不同）
val filterByName = ScanFilter.Builder()
    .setDeviceName("Mi Band 7")
    .build()

// 3. 按 MAC 地址过滤
val filterByMac = ScanFilter.Builder()
    .setDeviceAddress("AA:BB:CC:DD:EE:FF")
    .build()

// 4. 按厂商数据过滤（需要知道外设的 Manufacturer ID）
val filterByManufacturer = ScanFilter.Builder()
    .setManufacturerData(0x004C, byteArrayOf(...)) // 0x004C = Apple
    .build()
```

### 3.2 硬件过滤 vs 软件过滤

Android 5.0+ 支持硬件级过滤（offload 到蓝牙芯片），条件是：

- 过滤条件不太复杂（最多 16 个 `ScanFilter`）
- 芯片固件支持（Qualcomm 和 Broadcom 主流方案都支持）

**如果过滤条件太复杂或数量过多，系统会退化为软件过滤**——应用进程收到所有广播包，自己在 Java 层过滤。这会导致：

1. 更多 IPC（Binder 通信）开销
2. 更多 CPU 唤醒
3. 更耗电

**工程建议**：过滤条件尽量控制在 5~10 个以内，优先用 UUID 过滤（芯片最擅长）。

---

## 四、Android 实例：稳健的设备扫描流程

**场景**：用户点击"搜索设备"，扫描 10 秒，把找到的设备按信号强度排序显示在列表中。

```kotlin
class BleScanManager(private val context: Context) {

    private val scanner: BluetoothLeScanner? by lazy {
        val adapter = (context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager)
            .adapter
        adapter?.bluetoothLeScanner
    }

    // 去重：用 MAC 地址做 key，保留信号最好的那次结果
    private val scanResults = ConcurrentHashMap<String, ScanResult>()
    private val handler = Handler(Looper.getMainLooper())
    private var isScanning = false

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val address = result.device.address
            val existing = scanResults[address]

            // 保留 RSSI 更强的结果，或首次发现
            if (existing == null || result.rssi > existing.rssi) {
                scanResults[address] = result
                notifyDeviceUpdated(result)
            }
        }

        override fun onBatchScanResults(results: MutableList<ScanResult>) {
            // 仅当设置 setReportDelay > 0 时触发
            results.forEach { onScanResult(ScanSettings.CALLBACK_TYPE_ALL_MATCHES, it) }
        }

        override fun onScanFailed(errorCode: Int) {
            Log.e("BLE", "扫描失败，errorCode=$errorCode")
            stopScan()
        }
    }

    fun startScan(serviceUuid: UUID, durationMs: Long = 10_000) {
        if (isScanning) return
        val scanner = this.scanner ?: return

        scanResults.clear()
        isScanning = true

        val filter = ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(serviceUuid))
            .build()

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setCallbackType(ScanSettings.CALLBACK_TYPE_ALL_MATCHES)
            .build()

        try {
            scanner.startScan(listOf(filter), settings, scanCallback)
        } catch (e: IllegalStateException) {
            // 蓝牙未开启时 startScan 抛异常
            Log.e("BLE", "扫描启动失败：蓝牙可能未开启", e)
            isScanning = false
            return
        }

        // 定时停止扫描
        handler.postDelayed({ stopScan() }, durationMs)
    }

    fun stopScan() {
        if (!isScanning) return
        isScanning = false
        handler.removeCallbacksAndMessages(null)

        try {
            scanner?.stopScan(scanCallback)
        } catch (e: IllegalStateException) {
            // 蓝牙关闭后 stopScan 可能抛异常，忽略即可
        }
    }

    private fun notifyDeviceUpdated(result: ScanResult) {
        // 回调给 UI 层刷新列表
    }
}
```

**代码意图解读**：

- `ConcurrentHashMap` 做去重。**为什么？** `onScanResult` 回调在 Binder 线程（非主线程），如果 UI 层也在并发读取，需要线程安全的容器。
- 按 RSSI 保留最强信号。**为什么？** 同一个设备会多次广播，早期广播可能信号弱（设备刚进入范围），后期信号稳定。保留最强值让列表排序更稳定。
- `try-catch` 包裹 `startScan` 和 `stopScan`。**为什么？** 如果用户在扫描过程中去系统设置关了蓝牙，`scanner` 对象会失效，此时操作抛 `IllegalStateException`。这是生产环境崩溃日志的高频来源。
- `handler.postDelayed` 自动停止。**为什么？** 扫描不手动停，芯片射频会持续高功率运行，用户手机 5 分钟就没电。任何扫描都必须有超时机制。

---

## 五、扫描结果的解读

### 5.1 设备名称的两个来源

```kotlin
val result: ScanResult = ...

// 1. 广播包里的名称（外设主动声明）
val advertisedName = result.scanRecord?.deviceName

// 2. 系统缓存的本地名称（可能来自之前的 Bond 记录）
val cachedName = result.device.name
```

| 名称来源 | 什么时候有值 | 可信度 |
|---|---|---|
| `scanRecord?.deviceName` | 外设在广播包/扫描响应里带了名称 | 高，实时 |
| `device.name` | 系统 Bond 数据库有记录，或扫描记录缓存 | 可能过期，可能为 null |

**坑点**：很多外设为了节省广播包空间，不在广播里放名称，而是放在扫描响应中。如果 `ScanSettings` 没有正确配置，或者射频环境差没收到扫描响应，`deviceName` 就是 null。此时可以用 MAC 地址或厂商数据做兜底展示。

### 5.2 RSSI 与距离估算

```kotlin
val rssi = result.rssi          // 信号强度，单位 dBm，负值，越接近 0 越强
val txPower = result.scanRecord?.txPowerLevel  // 发射功率，通常 -59 ~ -65 dBm @ 1米

// 简易距离估算（基于自由空间路径损耗模型，仅供参考）
fun calculateDistance(rssi: Int, txPower: Int): Double {
    return 10.0.pow((txPower - rssi) / 20.0)
}
```

**注意**：这个公式在真实环境中误差极大（人体遮挡、墙体反射、多径效应），只能做"远/中/近"三档划分，不要用来精确测距。

---

## 六、边界认知

### 1. 扫描期间无法连接

**错误认知**：扫描和连接可以并发执行。

**事实**：蓝牙芯片在扫描时会持续占用射频信道，此时发起连接大概率失败。正确做法是先 `stopScan()`，再 `connectGatt()`。两者至少间隔 100~200ms，给芯片切换状态的时间。

### 2. `ScanCallback` 的线程

`onScanResult` 回调在 **Binder 线程池**（非主线程），可以直接做数据处理，但如果要更新 UI，必须切到主线程。上面的代码用 `ConcurrentHashMap` 解决并发读写，UI 更新通过主线程 Handler 或 LiveData 投递。

### 3. 扫描结果可能包含已绑定设备

即使设备已经 `BOND_BONDED`，扫描时它如果仍在广播，依然会出现在结果中。不要假设扫描结果都是未配对设备。

### 4. 某些外设使用可解析私有地址（RPA）

BLE 4.2+ 支持隐私功能，外设每次重启后广播的 MAC 地址会变化。此时按 MAC 地址过滤或去重会失效。**建议始终以服务 UUID 作为设备的唯一标识依据**，而不是 MAC 地址。

### 5. `startScan` 的并发限制

一个 App 只能同时运行 **一个** `ScanCallback`。如果你调了两次 `startScan` 传不同的 callback，第二次会覆盖第一次，导致第一次的回调永远收不到 `onScanFailed` 也不会被告知被取代。确保你的扫描管理器是单例模式。

---

## 七、质量自检

- [x] 三种扫描模式的适用场景能脱口而出吗？
- [x] 知道硬件过滤和软件过滤的区别，以及退化的后果吗？
- [x] 代码中有没有超时自动停止扫描的机制？
- [x] 是否用线程安全容器处理扫描结果去重？
- [x] 能区分广播名称 `scanRecord.deviceName` 和系统缓存名 `device.name` 吗？
- [x] 知道扫描和连接不能并发，必须先停再连吗？
- [x] `startScan`/`stopScan` 有没有加 try-catch 防御蓝牙被关闭的场景？
