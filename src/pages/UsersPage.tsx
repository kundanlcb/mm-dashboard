import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { Edit2, Shield, X, ShieldAlert } from 'lucide-react';

interface UserDetails {
  id: string;
  email: string;
  verified: boolean;
  active: boolean;
  createdAt: string;
}

interface Biodata {
  fullName: string | null;
  phoneNumber: string | null;
}

interface UserResponse {
  user: UserDetails;
  biodata: Biodata | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Create state
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createMobileNumber, setCreateMobileNumber] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createVerified, setCreateVerified] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Detail/Edit State
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [viewMode, setViewMode] = useState<'detail' | 'edit'>('detail');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobileNumber, setEditMobileNumber] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await apiClient.get<UserResponse[]>('/users');
      setUsers(data);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage(null);
    try {
      await apiClient.post('/users', { 
        name: createName,
        email: createEmail,
        mobileNumber: createMobileNumber, 
        password: createPassword, 
        verified: createVerified 
      });
      setCreateMessage({ type: 'success', text: `User created successfully.` });
      setCreateName('');
      setCreateEmail('');
      setCreateMobileNumber('');
      setCreatePassword('');
      setCreateVerified(false);
      fetchUsers();
    } catch (err: any) {
      setCreateMessage({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setCreateLoading(false);
    }
  };

  const openDetail = (item: UserResponse) => {
    setSelectedUser(item);
    setViewMode('detail');
  };

  const openEdit = (item: UserResponse) => {
    setSelectedUser(item);
    setEditName(item.biodata?.fullName || '');
    setEditEmail(item.user.email || '');
    setEditMobileNumber(item.biodata?.phoneNumber || '');
    setEditVerified(item.user.verified);
    setEditPassword('');
    setEditMessage(null);
    setViewMode('edit');
  };

  const closeDetail = () => {
    setSelectedUser(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setEditLoading(true);
    setEditMessage(null);
    try {
      const payload: any = { 
        name: editName,
        email: editEmail,
        mobileNumber: editMobileNumber, 
        verified: editVerified 
      };
      if (editPassword) {
        payload.password = editPassword;
      }
      await apiClient.put(`/users/${selectedUser.user.id}`, payload);
      setEditMessage({ type: 'success', text: 'User updated successfully.' });
      fetchUsers();
      setTimeout(() => closeDetail(), 1000);
    } catch (err: any) {
      setEditMessage({ type: 'error', text: err.message || 'Failed to update user.' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
      closeDetail();
    } catch (err: any) {
      console.error(err);
      alert('Failed to remove user: ' + err.message);
    }
  };

  const handleStatusToggle = async (item: UserResponse) => {
    try {
      await apiClient.put(`/users/${item.user.id}`, { 
        name: item.biodata?.fullName,
        email: item.user.email,
        mobileNumber: item.biodata?.phoneNumber, 
        verified: !item.user.verified 
      });
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Comprehensive control over all user accounts</p>
      </div>

      <div className="responsive-flex">
        {/* Create User Section */}
        <div className="glass-card" style={{ flex: '1', minWidth: '300px', alignSelf: 'flex-start' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create New User</h3>
          
          {createMessage && (
            <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: createMessage.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', fontSize: '0.9rem' }}>
              {createMessage.text}
            </div>
          )}

          <form onSubmit={handleCreateSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                className="input-field" 
                type="text" 
                placeholder="John Doe"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                className="input-field" 
                type="email" 
                placeholder="john@example.com"
                value={createEmail}
                onChange={e => setCreateEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                className="input-field" 
                type="text" 
                placeholder="+919876543210"
                value={createMobileNumber}
                onChange={e => setCreateMobileNumber(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input 
                className="input-field" 
                type="password" 
                placeholder="••••••••"
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
                required 
              />
            </div>
            <div className="form-group flex-row" style={{ alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="create-verified-check"
                checked={createVerified}
                onChange={e => setCreateVerified(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="create-verified-check" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' }}>
                Mark as Verified
              </label>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={createLoading}>
              {createLoading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Users List Section */}
        <div className="glass-card" style={{ flex: '2', minWidth: '350px' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3>All Users</h3>
            <span className="badge success">{users.length} users</span>
          </div>

          {fetchError ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
              {fetchError}
              <br/>
              <button onClick={fetchUsers} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
            </div>
          ) : loading && users.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>Status</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
                    </tr>
                  )}
                  {users.map(item => (
                    <tr key={item.user.id} onClick={() => openDetail(item)} style={{ cursor: 'pointer' }} className="table-row-hover">
                      <td style={{ fontWeight: 500 }}>{item.biodata?.fullName || '-'}</td>
                      <td>{item.user.email || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{item.biodata?.phoneNumber || '-'}</td>
                      <td>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusToggle(item); }}
                          className={`badge ${item.user.verified ? 'success' : 'danger'}`} 
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Click to toggle status"
                        >
                          {item.user.verified ? <Shield size={12} /> : <ShieldAlert size={12} />}
                          {item.user.verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="btn btn-primary" style={{ padding: '0.4rem', background: 'var(--accent)' }}>
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail/Edit Modal Overlay */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={closeDetail} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            {viewMode === 'detail' ? (
              <>
                <h3 style={{ marginBottom: '1.5rem', marginTop: '5px' }}>User Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</span>
                    <div style={{ fontWeight: 500 }}>{selectedUser.biodata?.fullName || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</span>
                    <div style={{ fontWeight: 500 }}>{selectedUser.user.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mobile Number</span>
                    <div style={{ fontWeight: 600 }}>{selectedUser.biodata?.phoneNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                    <div>
                      <span className={`badge ${selectedUser.user.verified ? 'success' : 'danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {selectedUser.user.verified ? <Shield size={12} /> : <ShieldAlert size={12} />}
                        {selectedUser.user.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => handleDeleteUser(selectedUser.user.id)} className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white', border: 'none' }}>
                    Remove User
                  </button>
                  <button type="button" onClick={() => openEdit(selectedUser)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Update User Detail
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '1.5rem', marginTop: '5px' }}>Edit User</h3>
                
                {editMessage && (
                  <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: editMessage.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', fontSize: '0.9rem' }}>
                    {editMessage.text}
                  </div>
                )}

                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input 
                      className="input-field" 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      className="input-field" 
                      type="email" 
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      className="input-field" 
                      type="text" 
                      value={editMobileNumber}
                      onChange={e => setEditMobileNumber(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group flex-row" style={{ alignItems: 'center', marginBottom: '1rem' }}>
                    <input 
                      type="checkbox" 
                      id="edit-verified-check"
                      checked={editVerified}
                      onChange={e => setEditVerified(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="edit-verified-check" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem' }}>
                      User is Verified
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Update Password (Optional)</label>
                    <input 
                      className="input-field" 
                      type="password" 
                      placeholder="Leave blank to keep current password"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setViewMode('detail')} className="btn" style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={editLoading}>
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
