import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Groups from './pages/Groups';
import Purchases from './pages/Purchases';
import ShoppingList from './pages/ShoppingList';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import CategoryProducts from './pages/categories/CategoryProducts';
import PurchaseHistory from './pages/PurchaseHistory';
import MonthlyDetails from './pages/analytics/MonthlyDetails';
import CategoryDetails from './pages/analytics/CategoryDetails';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="groups" element={<Groups />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/:categoryName" element={<CategoryProducts />} />
          <Route path="history" element={<PurchaseHistory />} />
          <Route path="shopping" element={<ShoppingList />} />
          <Route path="analytics/monthly" element={<MonthlyDetails />} />
          <Route path="analytics/categories" element={<CategoryDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;