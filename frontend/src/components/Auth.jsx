import React, { useState } from 'react';
import { login, signup } from '../api';
import './Auth.css';

const Auth = ({ onLogin, onPlayGuest }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const data = await login(username, password);
                onLogin(data.access_token, username);
            } else {
                await signup(username, password);
                const data = await login(username, password);
                onLogin(data.access_token, username);
            }
        } catch (err) {
            setError(err.message || "An error occurred");
        }
    };

    return (
        <div className="auth-container glass-panel">
            <h2>{isLogin ? 'START YOUR ADVENTURE' : 'JOIN THE SNAKE PIT'}</h2>
            {error && <p className="error-msg">{error}</p>}
            
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>
                
                <button type="submit" className="btn btn-primary">
                    {isLogin ? 'LOGIN' : 'SIGN UP'}
                </button>
            </form>

            <div className="auth-toggle">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'SIGN UP' : 'LOGIN'}
                </span>
            </div>

            <div className="divider"><span>OR</span></div>

            <button className="btn" onClick={onPlayGuest}>
                PLAY AS GUEST
            </button>
        </div>
    );
};

export default Auth;
