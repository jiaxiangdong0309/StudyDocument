import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AndroidPage from './pages/AndroidPage';
import JavaPage from './pages/JavaPage';
import FlutterPage from './pages/FlutterPage';
import VuePage from './pages/VuePage';
import AIPage from './pages/AIPage';
import './styles/index.css';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/android" element={<AndroidPage />} />
            <Route path="/java" element={<JavaPage />} />
            <Route path="/flutter" element={<FlutterPage />} />
            <Route path="/vue" element={<VuePage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;