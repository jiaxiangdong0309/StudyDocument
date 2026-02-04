import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '学习笔记',
  description: '个人技术学习笔记汇总',
  base: '/learning-notes/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'AI', link: '/AI/' },
      { text: 'Vue', link: '/Vue/' },
      { text: 'React', link: '/react/' },
      { text: 'Java', link: '/Java/' },
      { text: 'Android', link: '/Android/' },
      { text: 'Flutter', link: '/Flutter/' }
    ],
    sidebar: {
      '/AI/': [
        {
          text: 'AI 技术',
          items: [
            { text: '概述', link: '/AI/' }
          ]
        }
      ],
      '/Vue/': [
        {
          text: 'Vue 框架',
          items: [
            { text: 'Vue.js 框架介绍', link: '/Vue/Vue.js框架介绍' }
          ]
        }
      ],
      '/react/': [
        {
          text: 'React 框架',
          items: [
            { text: '概述', link: '/react/' }
          ]
        }
      ],
      '/Java/': [
        {
          text: 'Java 技术',
          items: [
            { text: '概述', link: '/Java/' }
          ]
        }
      ],
      '/Android/': [
        {
          text: 'Android 开发',
          items: [
            { text: '概述', link: '/Android/' }
          ]
        }
      ],
      '/Flutter/': [
        {
          text: 'Flutter 开发',
          items: [
            { text: '概述', link: '/Flutter/' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-profile' }
    ]
  }
})