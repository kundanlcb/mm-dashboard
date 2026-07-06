import { useState, useEffect, useMemo, useRef } from 'react';
import { apiClient } from '../api/apiClient';
import { Edit2, Shield, X, ShieldAlert, Plus, Search, Filter, SortAsc, SortDesc, ChevronDown, Check } from 'lucide-react';

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
  gender?: string | null;
  age?: number | null;
  gotra?: string | null;
  mool?: string | null;
  dateOfBirth?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  siblingsDetail?: string | null;
  grandparentName?: string | null;
  religion?: string | null;
  caste?: string | null;
  profession?: string | null;
  annualIncome?: number | null;
  location?: string | null;
  education?: string | null;
  aboutMe?: string | null;
  height?: string | null;
  maritalStatus?: string | null;
  diet?: string | null;
  complexion?: string | null;
}

interface UserResponse {
  user: UserDetails;
  biodata: Biodata | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'phone'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Create state
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createMobileNumber, setCreateMobileNumber] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createVerified, setCreateVerified] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detail/Edit/Create Modal State
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [viewMode, setViewMode] = useState<'detail' | 'edit' | 'create' | null>(null);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobileNumber, setEditMobileNumber] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [editBiodata, setEditBiodata] = useState<Partial<Biodata>>({});
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
      setTimeout(() => setViewMode(null), 1000);
    } catch (err: any) {
      setCreateMessage({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreate = () => {
    setCreateMessage(null);
    setCreateName('');
    setCreateEmail('');
    setCreateMobileNumber('');
    setCreatePassword('');
    setCreateVerified(false);
    setViewMode('create');
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
    setEditBiodata(item.biodata || {});
    setEditMessage(null);
    setViewMode('edit');
  };

  const closeModal = () => {
    setViewMode(null);
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
        verified: editVerified,
        ...editBiodata
      };
      if (editPassword) {
        payload.password = editPassword;
      }
      await apiClient.put(`/users/${selectedUser.user.id}`, payload);
      setEditMessage({ type: 'success', text: 'User updated successfully.' });
      fetchUsers();
      setTimeout(() => closeModal(), 1000);
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
      closeModal();
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

  const processedUsers = useMemo(() => {
    let result = [...users];

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.biodata?.fullName?.toLowerCase().includes(q) ||
        u.user.email?.toLowerCase().includes(q) ||
        u.biodata?.phoneNumber?.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (filterStatus === 'verified') {
      result = result.filter(u => u.user.verified);
    } else if (filterStatus === 'unverified') {
      result = result.filter(u => !u.user.verified);
    }

    // Sort
    result.sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortBy === 'name') {
        valA = a.biodata?.fullName || '';
        valB = b.biodata?.fullName || '';
      } else if (sortBy === 'email') {
        valA = a.user.email || '';
        valB = b.user.email || '';
      } else if (sortBy === 'phone') {
        valA = a.biodata?.phoneNumber || '';
        valB = b.biodata?.phoneNumber || '';
      }

      valA = valA.toLowerCase();
      valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, filterStatus, sortBy, sortOrder]);

  return (
    <div>
      <div className="page-header flex-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Comprehensive control over all user accounts</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: '32px' }}>
          <Plus size={18} />
          Add New User
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-row" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name, email, or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
          
          <div className="flex-row" style={{ gap: '0.5rem' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <div className="dropdown-container" ref={filterDropdownRef} style={{ marginBottom: 0, zIndex: 11 }}>
              <button 
                className="dropdown-trigger" 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                style={{ width: '150px', padding: '0.5rem 1rem' }}
              >
                {filterStatus === 'all' ? 'All Status' : filterStatus === 'verified' ? 'Verified' : 'Unverified'} 
                <ChevronDown size={18} style={{ transform: isFilterDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', marginLeft: '8px', color: 'var(--text-muted)' }} />
              </button>
              {isFilterDropdownOpen && (
                <div className="dropdown-menu">
                  {['all', 'verified', 'unverified'].map(status => (
                    <div 
                      key={status}
                      className={`dropdown-item ${filterStatus === status ? 'active' : ''}`}
                      onClick={() => {
                        setFilterStatus(status as any);
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      {filterStatus === status && <Check size={16} />}
                      <span style={{ marginLeft: filterStatus === status ? '0' : '24px' }}>
                        {status === 'all' ? 'All Status' : status === 'verified' ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-row" style={{ gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Sort by:</span>
            <div className="dropdown-container" ref={sortDropdownRef} style={{ marginBottom: 0, zIndex: 10 }}>
              <button 
                className="dropdown-trigger" 
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                style={{ width: '120px', padding: '0.5rem 1rem' }}
              >
                {sortBy === 'name' ? 'Name' : sortBy === 'email' ? 'Email' : 'Phone'}
                <ChevronDown size={18} style={{ transform: isSortDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', marginLeft: '8px', color: 'var(--text-muted)' }} />
              </button>
              {isSortDropdownOpen && (
                <div className="dropdown-menu">
                  {['name', 'email', 'phone'].map(sortOption => (
                    <div 
                      key={sortOption}
                      className={`dropdown-item ${sortBy === sortOption ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(sortOption as any);
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      {sortBy === sortOption && <Check size={16} />}
                      <span style={{ marginLeft: sortBy === sortOption ? '0' : '24px' }}>
                        {sortOption === 'name' ? 'Name' : sortOption === 'email' ? 'Email' : 'Phone'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')} 
              className="btn" 
              style={{ padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)' }}
              title={`Toggle to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Users List</h3>
          <span className="badge success">{processedUsers.length} users</span>
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
                {processedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching your criteria</td>
                  </tr>
                )}
                {processedUsers.map(item => (
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
                      <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="btn" style={{ padding: '0.4rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>
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

      {/* Modal Overlay for Create/Detail/Edit */}
      {viewMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: viewMode === 'edit' ? '800px' : '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={closeModal} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            {viewMode === 'create' && (
              <>
                <h3 style={{ marginBottom: '1.5rem', marginTop: '5px' }}>Create New User</h3>
                
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
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <button type="button" onClick={closeModal} className="btn" style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={createLoading}>
                      {createLoading ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {viewMode === 'detail' && selectedUser && (
              <>
                <h3 style={{ marginBottom: '1.5rem', marginTop: '5px' }}>User Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</span>
                      <div style={{ fontWeight: 500 }}>{selectedUser.biodata?.fullName || 'N/A'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                      <div>
                        <span className={`badge ${selectedUser.user.verified ? 'success' : 'danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {selectedUser.user.verified ? <Shield size={12} /> : <ShieldAlert size={12} />}
                          {selectedUser.user.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
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
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gender</span>
                    <div>{selectedUser.biodata?.gender || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Age</span>
                    <div>{selectedUser.biodata?.age || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date of Birth</span>
                    <div>{selectedUser.biodata?.dateOfBirth || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Birth Time</span>
                    <div>{selectedUser.biodata?.birthTime || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Birth Place</span>
                    <div>{selectedUser.biodata?.birthPlace || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Religion</span>
                    <div>{selectedUser.biodata?.religion || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Caste</span>
                    <div>{selectedUser.biodata?.caste || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gotra</span>
                    <div>{selectedUser.biodata?.gotra || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mool</span>
                    <div>{selectedUser.biodata?.mool || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Profession</span>
                    <div>{selectedUser.biodata?.profession || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Annual Income</span>
                    <div>{selectedUser.biodata?.annualIncome || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Education</span>
                    <div>{selectedUser.biodata?.education || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location</span>
                    <div>{selectedUser.biodata?.location || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Height</span>
                    <div>{selectedUser.biodata?.height || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Marital Status</span>
                    <div>{selectedUser.biodata?.maritalStatus || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Diet</span>
                    <div>{selectedUser.biodata?.diet || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complexion</span>
                    <div>{selectedUser.biodata?.complexion || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Father's Name</span>
                    <div>{selectedUser.biodata?.fatherName || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mother's Name</span>
                    <div>{selectedUser.biodata?.motherName || '-'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Siblings Detail</span>
                    <div>{selectedUser.biodata?.siblingsDetail || '-'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>About Me</span>
                    <div>{selectedUser.biodata?.aboutMe || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', position: 'sticky', bottom: 0, background: 'var(--card-bg)', padding: '10px 0', borderTop: '1px solid var(--border)', zIndex: 10 }}>
                  <button type="button" onClick={() => handleDeleteUser(selectedUser.user.id)} className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white', border: 'none' }}>
                    Remove User
                  </button>
                  <button type="button" onClick={() => openEdit(selectedUser)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Update User Detail
                  </button>
                </div>
              </>
            )}

            {viewMode === 'edit' && (
              <>
                <h3 style={{ marginBottom: '1.5rem', marginTop: '5px' }}>Edit User</h3>
                
                {editMessage && (
                  <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: editMessage.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', fontSize: '0.9rem' }}>
                    {editMessage.text}
                  </div>
                )}

                <form onSubmit={handleEditSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input 
                        className="input-field" 
                        type="text" 
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setEditBiodata({ ...editBiodata, fullName: e.target.value }); }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input 
                        className="input-field" 
                        type="email" 
                        value={editEmail}
                        disabled
                        style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input 
                        className="input-field" 
                        type="text" 
                        value={editMobileNumber}
                        disabled
                        style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Update Password</label>
                      <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Leave blank to keep current"
                        value={editPassword}
                        onChange={e => setEditPassword(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <input className="input-field" type="text" value={editBiodata.gender || ''} onChange={e => setEditBiodata({...editBiodata, gender: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input className="input-field" type="number" value={editBiodata.age || ''} onChange={e => setEditBiodata({...editBiodata, age: parseInt(e.target.value) || null})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input className="input-field" type="text" placeholder="YYYY-MM-DD" value={editBiodata.dateOfBirth || ''} onChange={e => setEditBiodata({...editBiodata, dateOfBirth: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Birth Time</label>
                      <input className="input-field" type="text" value={editBiodata.birthTime || ''} onChange={e => setEditBiodata({...editBiodata, birthTime: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Birth Place</label>
                      <input className="input-field" type="text" value={editBiodata.birthPlace || ''} onChange={e => setEditBiodata({...editBiodata, birthPlace: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Religion</label>
                      <input className="input-field" type="text" value={editBiodata.religion || ''} onChange={e => setEditBiodata({...editBiodata, religion: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Caste</label>
                      <input className="input-field" type="text" value={editBiodata.caste || ''} onChange={e => setEditBiodata({...editBiodata, caste: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gotra</label>
                      <input className="input-field" type="text" value={editBiodata.gotra || ''} onChange={e => setEditBiodata({...editBiodata, gotra: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mool</label>
                      <input className="input-field" type="text" value={editBiodata.mool || ''} onChange={e => setEditBiodata({...editBiodata, mool: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Profession</label>
                      <input className="input-field" type="text" value={editBiodata.profession || ''} onChange={e => setEditBiodata({...editBiodata, profession: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Annual Income</label>
                      <input className="input-field" type="number" value={editBiodata.annualIncome || ''} onChange={e => setEditBiodata({...editBiodata, annualIncome: parseInt(e.target.value) || null})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <input className="input-field" type="text" value={editBiodata.education || ''} onChange={e => setEditBiodata({...editBiodata, education: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="input-field" type="text" value={editBiodata.location || ''} onChange={e => setEditBiodata({...editBiodata, location: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Height</label>
                      <input className="input-field" type="text" value={editBiodata.height || ''} onChange={e => setEditBiodata({...editBiodata, height: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marital Status</label>
                      <input className="input-field" type="text" value={editBiodata.maritalStatus || ''} onChange={e => setEditBiodata({...editBiodata, maritalStatus: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diet</label>
                      <input className="input-field" type="text" value={editBiodata.diet || ''} onChange={e => setEditBiodata({...editBiodata, diet: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Complexion</label>
                      <input className="input-field" type="text" value={editBiodata.complexion || ''} onChange={e => setEditBiodata({...editBiodata, complexion: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Father's Name</label>
                      <input className="input-field" type="text" value={editBiodata.fatherName || ''} onChange={e => setEditBiodata({...editBiodata, fatherName: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mother's Name</label>
                      <input className="input-field" type="text" value={editBiodata.motherName || ''} onChange={e => setEditBiodata({...editBiodata, motherName: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Siblings Detail</label>
                      <input className="input-field" type="text" value={editBiodata.siblingsDetail || ''} onChange={e => setEditBiodata({...editBiodata, siblingsDetail: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">About Me</label>
                      <textarea className="input-field" rows={3} value={editBiodata.aboutMe || ''} onChange={e => setEditBiodata({...editBiodata, aboutMe: e.target.value})}></textarea>
                    </div>

                    <div className="form-group flex-row" style={{ alignItems: 'center', gridColumn: '1 / -1', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id="edit-verified-check"
                        checked={editVerified}
                        onChange={e => setEditVerified(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="edit-verified-check" style={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', marginLeft: '8px' }}>
                        User is Verified
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', position: 'sticky', bottom: 0, background: 'var(--card-bg)', padding: '10px 0', borderTop: '1px solid var(--border)', zIndex: 10 }}>
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
