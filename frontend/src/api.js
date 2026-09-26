const API_URL = 'http://localhost:8000';

export const signup = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            throw new Error(data.detail || "Signup failed");
        } catch(e) {
            throw new Error("Signup failed");
        }
    }
    return res.json();
};

export const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });
    if (!res.ok) {
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            throw new Error(data.detail || "Login failed");
        } catch(e) {
            throw new Error("Login failed");
        }
    }
    return res.json();
};

export const submitScore = async (token, score) => {
    const res = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score })
    });
    if (!res.ok) throw new Error("Failed to submit score");
    return res.json();
};

export const getLeaderboard = async () => {
    const res = await fetch(`${API_URL}/scores/leaderboard?limit=10`);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return res.json();
};
