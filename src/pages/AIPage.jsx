import React from 'react';
import ContentDisplay from '../components/ContentDisplay';

const AIPage = () => {
  return (
    <div className="page ai-page">
      <h1>AI 技术笔记</h1>
      <ContentDisplay directory="AI" />
    </div>
  );
};

export default AIPage;