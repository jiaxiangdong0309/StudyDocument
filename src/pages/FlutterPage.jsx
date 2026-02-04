import React from 'react';
import ContentDisplay from '../components/ContentDisplay';

const FlutterPage = () => {
  return (
    <div className="page flutter-page">
      <h1>Flutter 技术笔记</h1>
      <ContentDisplay directory="Flutter" />
    </div>
  );
};

export default FlutterPage;