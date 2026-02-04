import React from 'react';
import ContentDisplay from '../components/ContentDisplay';

const AndroidPage = () => {
  // 读取Android目录下的内容并展示
  return (
    <div className="page android-page">
      <h1>Android 技术笔记</h1>
      <ContentDisplay directory="Android" />
    </div>
  );
};

export default AndroidPage;