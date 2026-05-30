import { useState } from 'react';
import { apiClient } from '../api/apiClient';

export default function UsersPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await apiClient.post('/users', { mobileNumber, password, verified });
      setMessage({ type: 'success', text: `User ${mobileNumber} created successfully.` });
      setMobileNumber('');
      setPassword('');
      setVerified(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Create and manage user accounts</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Create New User</h3>
        
        {message && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="+919876543210"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input 
              className="input-field" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="form-group flex-row" style={{ alignItems: 'center' }}>
            <input 
              type="checkbox" 
              id="verified-check"
              checked={verified}
              onChange={e => setVerified(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="verified-check" style={{ cursor: 'pointer', fontWeight: 500 }}>
              Mark as Verified (Skip OTP)
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}
