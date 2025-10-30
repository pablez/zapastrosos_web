import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  Package, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  FileText
} from 'lucide-react';
import OrderLocationMap from './OrderLocationMap';
import PaymentProofViewer from './PaymentProofViewer';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, pending_payment, completed, cancelled

  // Cargar pedidos desde Firestore
  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Actualizar estado del pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      alert('Estado del pedido actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  // Eliminar pedido
  const deleteOrder = async (orderId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        setOrders(orders.filter(order => order.id !== orderId));
        alert('Pedido eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando pedido:', error);
        alert('Error al eliminar el pedido');
      }
    }
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Obtener color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pending_payment': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener ícono del estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'pending_payment': return <DollarSign className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Obtener texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'pending_payment': return 'Pago Pendiente';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // Ver detalles del pedido
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <button 
          onClick={loadOrders}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 flex items-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pendientes ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('pending_payment')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'pending_payment' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pago Pendiente ({orders.filter(o => o.status === 'pending_payment').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Completados ({orders.filter(o => o.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Cancelados ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'No se han realizado pedidos aún.' : `No hay pedidos con estado "${getStatusText(filter)}".`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{order.items?.length || 0} productos</span>
                        {order.paymentProofs && order.paymentProofs.length > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FileText className="w-3 h-3 mr-1" />
                            {order.paymentProofs.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Bs. {order.summary?.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt?.toDate ? 
                        order.createdAt.toDate().toLocaleDateString() : 
                        new Date(order.createdAt).toLocaleDateString()
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-cyan-600 hover:text-cyan-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs border rounded px-1 py-1"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="pending_payment">Pago Pendiente</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del Pedido #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información del cliente */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedOrder.customer?.email}
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedOrder.customer?.phone}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedOrder.customer?.address}, {selectedOrder.customer?.city}
                    </p>
                  </div>
                </div>

                {/* Información del pedido */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Información del Pedido
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <strong>Fecha:</strong> {selectedOrder.createdAt?.toDate ? 
                        selectedOrder.createdAt.toDate().toLocaleString() : 
                        new Date(selectedOrder.createdAt).toLocaleString()
                      }
                    </p>
                    <p className="flex items-center">
                      {selectedOrder.paymentMethod === 'yape' ? <Smartphone className="w-4 h-4 mr-1" /> : <CreditCard className="w-4 h-4 mr-1" />}
                      <strong>Pago:</strong> {selectedOrder.paymentMethod === 'yape' ? 'Yape' : selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <strong>Estado:</strong> 
                      <span className={`ml-2 inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span>{getStatusText(selectedOrder.status)}</span>
                      </span>
                    </p>
                    <p><strong>Tipo:</strong> {selectedOrder.customerType === 'guest' ? 'Invitado' : 'Registrado'}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación de entrega */}
              {selectedOrder.customer?.location && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Ubicación de Entrega</h3>
                  <OrderLocationMap order={selectedOrder} />
                </div>
              )}

              {/* Productos del pedido */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.size && `Talla: ${item.size}`} {item.color && `| Color: ${item.color}`}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">Bs. {item.price?.toFixed(2)}</td>
                          <td className="px-4 py-2">Bs. {item.subtotal?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen de costos */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen de Costos</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Bs. {selectedOrder.summary?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Delivery:</span>
                    <span>Bs. {selectedOrder.summary?.shipping?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>Bs. {selectedOrder.summary?.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Comprobantes de pago */}
              <div className="mt-6">
                <PaymentProofViewer paymentProofs={selectedOrder.paymentProofs} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;