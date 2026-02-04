import React from 'react';
import ContentDisplay from '../components/ContentDisplay';

const JavaPage = () => {
  return (
    <div className="page java-page">
      <h1>Java 技术笔记</h1>
      <ContentDisplay directory="Java" />
    </div>
  );
};

export default JavaPage;