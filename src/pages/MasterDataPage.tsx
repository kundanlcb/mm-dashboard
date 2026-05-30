import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { Trash2, Plus } from 'lucide-react';

const TYPES = ['City', 'Gotra', 'Religion', 'Caste', 'Profession'];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState(TYPES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>(`/master-data/${activeTab.toLowerCase()}`);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await apiClient.post('/master-data', { type: activeTab, name: newName });
      setNewName('');
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiClient.delete(`/master-data/${activeTab.toLowerCase()}/${id}`);
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Master Data</h1>
        <p className="page-subtitle">Manage dropdown lists and enumerations</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {TYPES.map(type => (
          <button 
            key={type}
            onClick={() => setActiveTab(type)}
            className={`btn ${activeTab === type ? 'btn-primary' : ''}`}
            style={{ 
              background: activeTab === type ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === type ? 'white' : 'var(--text-main)',
              border: `1px solid ${activeTab === type ? 'var(--primary)' : 'var(--border-light)'}`
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="responsive-flex">
        <div className="glass-card" style={{ flex: '2', minWidth: '300px' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3>{activeTab} List</h3>
            <span className="badge success">{items.length} records</span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items found</td>
                  </tr>
                )}
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-card" style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Add New {activeTab}</h3>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">{activeTab} Name</label>
              <input 
                className="input-field" 
                type="text" 
                placeholder={`Enter ${activeTab.toLowerCase()} name...`}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Add Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
