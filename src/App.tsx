import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import UsersPage from './pages/UsersPage';
import MasterDataPage from './pages/MasterDataPage';
import LoginPage from './pages/LoginPage';
import './styles/index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) return null; // loading state

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
