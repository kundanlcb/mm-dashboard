import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/apiClient';
import { Trash2, Plus, ChevronDown, Check } from 'lucide-react';

const TYPES = ['City', 'Gotra', 'Religion', 'Caste', 'Profession'];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState(TYPES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


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

      <div className="dropdown-container" ref={dropdownRef}>
        <button 
          className="dropdown-trigger" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {activeTab} Data <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {TYPES.map(type => (
              <div 
                key={type}
                className={`dropdown-item ${activeTab === type ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(type);
                  setIsDropdownOpen(false);
                }}
              >
                {activeTab === type && <Check size={16} />}
                <span style={{ marginLeft: activeTab === type ? '0' : '24px' }}>{type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="responsive-flex">
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

        <div className="glass-card" style={{ flex: '2', minWidth: '300px' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3>{activeTab} List</h3>
            <span className="badge success">{items.length} records</span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <div className="data-table-wrapper">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
