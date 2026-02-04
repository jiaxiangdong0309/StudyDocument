import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 模拟从后端或文件系统获取内容
const mockContentData = {
  Android: [
    { id: 'intro', title: 'Android简介', content: '# Android简介\n\nAndroid是Google开发的基于Linux内核的开源手机操作系统。' },
    { id: 'activity', title: 'Activity生命周期', content: '# Activity生命周期\n\nActivity是Android应用的一个核心组件...' }
  ],
  Java: [
    { id: 'basics', title: 'Java基础', content: '# Java基础知识\n\nJava是一种面向对象的编程语言...' }
  ],
  Flutter: [
    { id: 'widgets', title: 'Flutter Widgets', content: '# Flutter Widgets\n\nWidget是Flutter的核心概念...' }
  ],
  Vue: [
    { id: 'composition-api', title: 'Composition API', content: '# Vue Composition API\n\nVue 3引入了Composition API...' }
  ],
  AI: [
    { id: 'ml-basics', title: '机器学习基础', content: '# 机器学习基础\n\n机器学习是人工智能的一个重要分支...' }
  ]
};

const ContentDisplay = ({ directory }) => {
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    // 获取指定目录的内容
    if (mockContentData[directory]) {
      setContents(mockContentData[directory]);
      if (mockContentData[directory].length > 0) {
        setSelectedContent(mockContentData[directory][0]);
      }
    } else {
      setContents([]);
      setSelectedContent(null);
    }
  }, [directory]);

  return (
    <div className="content-display">
      <div className="content-nav">
        <h3>{directory} 笔记列表</h3>
        <ul>
          {contents.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setSelectedContent(item)}
                className={`nav-item ${selectedContent?.id === item.id ? 'active' : ''}`}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="content-viewer">
        {selectedContent ? (
          <div className="content-body">
            <h2>{selectedContent.title}</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selectedContent.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p>暂无内容</p>
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;