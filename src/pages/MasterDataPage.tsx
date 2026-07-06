import { useState, useEffect, useRef, useMemo } from 'react';
import { apiClient } from '../api/apiClient';
import { Trash2, Plus, ChevronDown, Check, Search, SortAsc, SortDesc, X } from 'lucide-react';

const TYPES = ['City', 'Gotra', 'Religion', 'Caste', 'Profession'];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState(TYPES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Create State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      setIsCreateModalOpen(false);
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

  const processedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.name?.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const valA = (a.name || '').toLowerCase();
      const valB = (b.name || '').toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, sortOrder]);

  const openCreateModal = () => {
    setNewName('');
    setIsCreateModalOpen(true);
  };

  return (
    <div>
      <div className="page-header flex-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Master Data</h1>
          <p className="page-subtitle">Manage dropdown lists and enumerations</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '32px' }}>
          <Plus size={18} />
          Add New {activeTab}
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-row" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
          
          <div className="dropdown-container" ref={dropdownRef} style={{ marginBottom: 0, zIndex: 10 }}>
            <button 
              className="dropdown-trigger" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ minWidth: '180px' }}
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
                      setSearchQuery('');
                    }}
                  >
                    {activeTab === type && <Check size={16} />}
                    <span style={{ marginLeft: activeTab === type ? '0' : '24px' }}>{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-row" style={{ flex: '1', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', maxWidth: '350px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>

            <div className="flex-row" style={{ gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Sort by Name:</span>
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
        </div>

        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{activeTab} List</h3>
          <span className="badge success">{processedItems.length} records</span>
        </div>

        {loading && items.length === 0 ? (
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
                {processedItems.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items found matching your criteria</td>
                  </tr>
                )}
                {processedItems.map(item => (
                  <tr key={item.id} className="table-row-hover">
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

      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setIsCreateModalOpen(false)} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', marginTop: '5px' }}>Add New {activeTab}</h3>
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
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn" style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Plus size={18} /> Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
