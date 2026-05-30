import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Database, Shield, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="sidebar-brand" style={{ margin: 0, padding: 0 }}>
          <Shield className="brand-icon" size={24} />
          <span>MM Admin</span>
        </div>
        <button className="menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu}></div>
      )}

      <nav className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Shield className="brand-icon" />
            <span>MM Admin</span>
          </div>
          <button className="mobile-close-btn" onClick={closeMenu}>
            <X size={24} />
          </button>
        </div>
        
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
          <Users size={20} />
          <span>User Management</span>
        </NavLink>
        
        <NavLink to="/master-data" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
          <Database size={20} />
          <span>Master Data</span>
        </NavLink>

        <div style={{ flex: 1 }}></div>

        <button 
          onClick={() => {
            localStorage.removeItem('admin_token');
            window.location.reload();
          }} 
          className="nav-link" 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', color: 'var(--danger)', marginTop: 'auto' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
