import React from 'react';
import ContentDisplay from '../components/ContentDisplay';

const VuePage = () => {
  return (
    <div className="page vue-page">
      <h1>Vue 技术笔记</h1>
      <ContentDisplay directory="Vue" />
    </div>
  );
};

export default VuePage;