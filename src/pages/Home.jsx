import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    { title: 'AI 技术', path: '/ai', details: '探索人工智能领域的最新技术和应用' },
    { title: '前端框架', path: '/vue', details: 'Vue.js、React 等前端框架的学习总结' },
    { title: '移动开发', path: '/android', details: 'Android、Flutter 等移动开发技术' },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <h2>欢迎来到学习笔记</h2>
        <p>记录学习历程，分享技术心得</p>
      </section>

      <section className="features">
        <h3>技术领域</h3>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h4>{feature.title}</h4>
              <p>{feature.details}</p>
              <Link to={feature.path} className="btn">开始阅读</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;