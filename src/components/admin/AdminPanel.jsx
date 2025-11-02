import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, LogOut } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminBreadcrumb from './AdminBreadcrumb';
import AdminDashboard from './AdminDashboard';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';
import AdminProfile from './AdminProfile';
import Reports from './Reports';

const AdminPanel = () => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🔥 AdminPanel renderizado con nuevo diseño:', { sidebarOpen, user: user?.email });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Marcar el documento cuando estemos en el admin para poder sobrescribir estilos globales (p.ej. #root centrado)
  useEffect(() => {
    document.documentElement.classList.add('admin-mode');
    return () => document.documentElement.classList.remove('admin-mode');
  }, []);

  // Mantener la sidebar abierta en pantallas grandes y hacerla responsive en pantallas pequeñas.
  useEffect(() => {
    const setOpenByWidth = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint (changed from lg)
      setSidebarOpen(isDesktop);
    };

    // Inicializar según el tamaño actual
    setOpenByWidth();

    // Escuchar cambios de tamaño y actualizar comportamiento
    window.addEventListener('resize', setOpenByWidth);
    return () => window.removeEventListener('resize', setOpenByWidth);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
  <div className="flex-1">
      {/* Top header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="w-full mx-0 px-0 pl-3">
        <div className="flex justify-between items-center h-12">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="md:hidden ml-4 flex items-center space-x-2">
                  <img src="/images/logos/letras-logo.webp" alt="Zapastroso" className="h-8 md:h-10 object-contain" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.email || 'Administrador'}
                    </div>
                    <div className="text-xs text-gray-500">Admin</div>
                  </div>
                  <div className="bg-cyan-100 p-1.5 rounded-full">
                    <span className="text-cyan-600 font-semibold text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white p-2 md:px-3 md:py-1.5 rounded-full md:rounded-lg hover:bg-red-700 transition-colors duration-200 inline-flex items-center text-sm"
                  aria-label="Salir"
                >
                  <LogOut className="w-4 h-4 md:mr-1.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </header>

  {/* Page content */}
  <main className="px-0 py-4 pl-3 pr-4 sm:pr-6 lg:pr-10">
   <div className="w-full mx-0 px-0">
            <AdminBreadcrumb />
            {/* Nuevo diseño con sidebar aplicado correctamente */}
            <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/productos" element={<ProductManagement />} />
            <Route path="/categorias" element={<CategoryManagement />} />
            <Route path="/pedidos" element={<OrderManagement />} />
            <Route path="/usuarios" element={<UserManagement />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/perfil" element={<AdminProfile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;