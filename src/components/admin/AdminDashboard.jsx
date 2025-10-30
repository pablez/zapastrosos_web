import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, TrendingUp, Database, Tag } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard de Administración</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Productos</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pedidos</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Users className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Usuarios</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold">$--</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gestión de Productos</h2>
          <p className="text-gray-600 mb-4">
            Administra tu inventario, añade nuevos productos y actualiza precios.
          </p>
          <Link 
            to="/admin/productos"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Gestionar Productos
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gestión de Categorías</h2>
          <p className="text-gray-600 mb-4">
            Organiza tus productos en categorías para mejor navegación.
          </p>
          <Link 
            to="/admin/categorias"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-flex items-center"
          >
            <Tag className="w-4 h-4 mr-2" />
            Ver Categorías
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gestión de Pedidos</h2>
          <p className="text-gray-600 mb-4">
            Revisa pedidos pendientes, confirma pagos y gestiona entregas.
          </p>
          <Link 
            to="/admin/pedidos"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Ver Pedidos
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Inicializar Datos</h2>
          <p className="text-gray-600 mb-4">
            Carga productos y categorías de muestra para comenzar tu tienda.
          </p>
          <Link 
            to="/admin/inicializar"
            className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 inline-flex items-center"
          >
            <Database className="w-4 h-4 mr-2" />
            Poblar Base de Datos
          </Link>
        </div>
      </div>
      
      {/* Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Database className="w-6 h-6 text-blue-600 mt-1 mr-4 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 ¡Primeros Pasos con Zapastroso!
            </h3>
            <p className="text-blue-800 mb-4">
              Para comenzar tu tienda, necesitas poblar la base de datos con productos iniciales. 
              Esto te permitirá ver cómo funciona todo el sistema.
            </p>
            <Link 
              to="/admin/inicializar"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-flex items-center font-medium"
            >
              <Database className="w-4 h-4 mr-2" />
              Inicializar Datos Ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;