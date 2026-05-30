import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import UsersPage from './pages/UsersPage';
import MasterDataPage from './pages/MasterDataPage';
import './styles/index.css';

function App() {
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
