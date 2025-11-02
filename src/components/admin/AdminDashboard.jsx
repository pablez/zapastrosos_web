import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, TrendingUp, Database, Tag, Activity, DollarSign, User } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Panel de control y estadísticas</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={stats.loading}
          className="bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center text-sm"
        >
          <TrendingUp className="w-4 h-4 mr-1.5" />
          {stats.loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Mostrar errores si los hay */}
      {stats.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <strong>Error:</strong> {stats.error}
        </div>
      )}
      
      {/* Stats Cards - Más compactas */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Productos Totales */}
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs text-gray-600 truncate">Productos</p>
              <p className="text-xl font-bold text-blue-600">
                {stats.loading ? '...' : stats.productos}
              </p>
            </div>
          </div>
        </div>

        {/* Pedidos Totales */}
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ShoppingCart className="text-orange-600" size={20} />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs text-gray-600 truncate">Pedidos</p>
              <p className="text-xl font-bold text-orange-600">
                {stats.loading ? '...' : stats.pedidos}
              </p>
            </div>
          </div>
        </div>

        {/* Ventas Pendientes */}
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <Activity className="text-green-600" size={20} />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs text-gray-600 truncate">Pendientes</p>
              <p className="text-lg font-bold text-green-600">
                {stats.loading ? '...' : `$${stats.ventasPendientes.toFixed(0)}`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Ventas Hoy */}
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs text-gray-600 truncate">Hoy</p>
              <p className="text-lg font-bold text-purple-600">
                {stats.loading ? '...' : `$${stats.ventasHoy.toFixed(0)}`}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions - Más compactas y mejor distribuidas */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Productos</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Gestiona inventario y precios
          </p>
          <Link 
            to="/admin/productos"
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm inline-flex items-center"
          >
            Gestionar
          </Link>
        </div>
        
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <Tag className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Categorías</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Organiza productos
          </p>
          <Link 
            to="/admin/categorias"
            className="bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 text-sm inline-flex items-center"
          >
            Ver
          </Link>
        </div>
        
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Pedidos</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Gestiona entregas
          </p>
          <Link 
            to="/admin/pedidos"
            className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm inline-flex items-center"
          >
            Ver
          </Link>
        </div>
        
        {/* Datos panel removed by request */}

  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <Users className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Admins</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Gestionar usuarios
          </p>
          <Link 
            to="/admin/usuarios"
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-sm inline-flex items-center"
          >
            Gestionar
          </Link>
        </div>

  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-pink-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Editar datos
          </p>
          <Link 
            to="/admin/perfil"
            className="bg-pink-600 text-white px-3 py-1.5 rounded-md hover:bg-pink-700 text-sm inline-flex items-center"
          >
            Editar
          </Link>
        </div>
      </div>
      
      {/* Notice - Más compacto */}
      {/* "Primeros Pasos" notice removed by request */}

      {/* Información adicional en espacio libre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <ShoppingCart className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-green-900 mb-1">
                📊 Estado de Ventas
              </h3>
              <p className="text-sm text-green-800 mb-2">
                {stats.loading ? 'Cargando...' : `${stats.pedidos} pedidos procesados hasta ahora`}
              </p>
              <div className="text-xs text-green-700">
                <span className="font-medium">${stats.ventasHoy.toFixed(0)}</span> vendido hoy • 
                <span className="font-medium"> ${stats.ventasPendientes.toFixed(0)}</span> pendiente
              </div>
            </div>
          </div>
        </div>

  <div className="bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <Package className="w-5 h-5 text-purple-600 mt-0.5 mr-3 shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-purple-900 mb-1">
                📦 Inventario
              </h3>
              <p className="text-sm text-purple-800 mb-2">
                {stats.loading ? 'Cargando...' : `${stats.productos} productos en catálogo`}
              </p>
              <div className="text-xs text-purple-700">
                Gestiona tu inventario y mantén el stock actualizado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;