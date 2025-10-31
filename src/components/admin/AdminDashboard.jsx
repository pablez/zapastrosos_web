import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, TrendingUp, Database, Tag, Activity, DollarSign } from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productos: 0,
    pedidos: 0,
    ventasHoy: 0,
    ventasPendientes: 0,
    loading: true,
    error: null
  });

  // Función simplificada para probar conexión
  const testFirebaseConnection = async () => {
    try {
      console.log('🧪 Probando conexión a Firebase...');
      const testSnapshot = await getDocs(collection(db, 'products'));
      console.log('✅ Conexión exitosa. Documentos encontrados:', testSnapshot.docs.length);
      return true;
    } catch (error) {
      console.error('❌ Error de conexión a Firebase:', error);
      setStats(prev => ({ ...prev, error: error.message }));
      return false;
    }
  };

  // Función para obtener estadísticas en tiempo real
  const fetchStats = async () => {
    try {
      console.log('🔄 Iniciando carga de estadísticas...');
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Probar conexión primero
      const connectionOk = await testFirebaseConnection();
      if (!connectionOk) {
        return;
      }

      // Contar productos totales
      console.log('📦 Consultando productos...');
      const productosSnapshot = await getDocs(collection(db, 'products'));
      const totalProductos = productosSnapshot.size;
      console.log('📦 Productos encontrados:', totalProductos);

      // Contar pedidos totales
      console.log('🛒 Consultando pedidos...');
      const pedidosSnapshot = await getDocs(collection(db, 'orders'));
      const totalPedidos = pedidosSnapshot.size;
      console.log('🛒 Pedidos encontrados:', totalPedidos);

      // Calcular ventas de hoy y ventas pendientes
      console.log('💰 Analizando pedidos para ventas...');
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const finDelDia = new Date(hoy);
      finDelDia.setHours(23, 59, 59, 999);
      
      console.log('📅 Rango de fechas para hoy:', hoy, 'a', finDelDia);

      let ventasHoy = 0;
      let ventasPendientes = 0;

      // Procesar todos los pedidos
      pedidosSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('📋 Procesando pedido:', doc.id, {
          status: data.status,
          createdAt: data.createdAt?.toDate(),
          total: data.summary?.total
        });

        // Ventas completadas de hoy
        if (data.status === 'completed' && data.createdAt) {
          const fechaPedido = data.createdAt.toDate();
          
          if (fechaPedido >= hoy && fechaPedido <= finDelDia) {
            const total = data.summary?.total || 0;
            ventasHoy += total;
            console.log(`💵 Venta del día: $${total} (Total: $${ventasHoy})`);
          }
        }

        // Ventas pendientes (cualquier día)
        if (data.status === 'pending') {
          const total = data.summary?.total || 0;
          ventasPendientes += total;
          console.log(`⏳ Venta pendiente: $${total} (Total pendiente: $${ventasPendientes})`);
        }
      });

      console.log('📊 Estadísticas finales:', {
        productos: totalProductos,
        pedidos: totalPedidos,
        ventasHoy: ventasHoy,
        ventasPendientes: ventasPendientes
      });

      setStats({
        productos: totalProductos,
        pedidos: totalPedidos,
        ventasHoy: ventasHoy,
        ventasPendientes: ventasPendientes,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Error: ${error.message}` 
      }));
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchStats();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <button
          onClick={fetchStats}
          disabled={stats.loading}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {stats.loading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* Mostrar errores si los hay */}
      {stats.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {stats.error}
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Productos Totales */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.loading ? '...' : stats.productos}
              </p>
              <p className="text-xs text-gray-500">En catálogo</p>
            </div>
          </div>
        </div>

        {/* Ventas Pendientes */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ventas Pendientes</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.loading ? '...' : `$${stats.ventasPendientes.toFixed(2)}`}
              </p>
              <p className="text-xs text-gray-500">Por confirmar</p>
            </div>
          </div>
        </div>

        {/* Pedidos Totales */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ShoppingCart className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.loading ? '...' : stats.pedidos}
              </p>
              <p className="text-xs text-gray-500">Historial completo</p>
            </div>
          </div>
        </div>
        
        {/* Ventas Hoy */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.loading ? '...' : `$${stats.ventasHoy.toFixed(2)}`}
              </p>
              <p className="text-xs text-gray-500">Solo completadas</p>
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