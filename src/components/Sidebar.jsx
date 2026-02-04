import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/android', label: 'Android' },
    { path: '/java', label: 'Java' },
    { path: '/flutter', label: 'Flutter' },
    { path: '/vue', label: 'Vue' },
    { path: '/ai', label: 'AI' },
  ];

  return (
    <nav className="sidebar">
      <ul>
        {navItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className="nav-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;