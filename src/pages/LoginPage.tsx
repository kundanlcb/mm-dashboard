import { useState } from 'react';
import { Shield } from 'lucide-react';

import { apiClient } from '../api/apiClient';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient.post<{ token: string }>('/login', { username, password });
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 className="page-title">Admin Login</h2>
          <p className="page-subtitle">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--danger)', color: 'white', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Enter admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="input-field" 
              type="password" 
              placeholder="Enter admin123"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
