import { NavLink, Outlet } from 'react-router-dom';
import { Users, Database, Shield } from 'lucide-react';

export default function Layout() {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <Shield className="brand-icon" />
          <span>MM Admin</span>
        </div>
        
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>User Management</span>
        </NavLink>
        
        <NavLink to="/master-data" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Database size={20} />
          <span>Master Data</span>
        </NavLink>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
