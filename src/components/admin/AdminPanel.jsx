import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import OrderManagement from './OrderManagement';
import DataInitializer from './DataInitializer';

const AdminPanel = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/logos/zapastroso-logo.png" 
                  alt="Zapastroso Logo" 
                  className="h-10 w-auto rounded-md shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center space-x-2" style={{display: 'none'}}>
                  <span className="text-2xl">👟</span>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    Admin - Zapastroso
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/productos" element={<ProductManagement />} />
          <Route path="/categorias" element={<CategoryManagement />} />
          <Route path="/pedidos" element={<OrderManagement />} />
          <Route path="/inicializar" element={<DataInitializer />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;