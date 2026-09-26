import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';
import './Leaderboard.css';

const Leaderboard = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const data = await getLeaderboard();
                setScores(data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
        
        // Setup polling every 10 seconds to keep leaderboard fresh
        const interval = setInterval(fetchScores, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="leaderboard glass-panel">
            <h3>LEADERBOARD</h3>
            {loading && scores.length === 0 ? <p className="loading">Loading...</p> : (
                <div className="score-list">
                    {scores.map((s, idx) => (
                        <div key={idx} className="score-item">
                            <span className="rank">{idx + 1}.</span>
                            <span className="username">{s.username}</span>
                            <span className="score">{s.score}</span>
                        </div>
                    ))}
                    {scores.length === 0 && <p className="no-scores">No scores yet.</p>}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
