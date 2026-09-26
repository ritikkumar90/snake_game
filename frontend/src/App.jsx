import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import Auth from './components/Auth';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [isGuest, setIsGuest] = useState(false);

  const handleLogin = (jwt, user) => {
    setToken(jwt);
    setUsername(user);
    localStorage.setItem('token', jwt);
    localStorage.setItem('username', user);
    setIsGuest(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsGuest(false);
  };

  const handlePlayGuest = () => {
    setIsGuest(true);
  };

  if (!token && !isGuest) {
    return (
      <div className="app-layout">
        <Auth onLogin={handleLogin} onPlayGuest={handlePlayGuest} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="top-nav">
          <div className="brand">NEON <span>SLITHER</span></div>
          <div className="user-info">
             {token ? `Playing as: ${username}` : 'Playing as: Guest'}
             <button className="btn" onClick={handleLogout}>
                {token ? 'Logout' : 'Quit'}
             </button>
          </div>
      </div>
      <div className="game-area">
        <SnakeGame token={token} />
        <Leaderboard />
      </div>
    </div>
  );
}

export default App;
