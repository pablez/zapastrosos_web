import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc, increment } from 'firebase/firestore';
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
import ConfirmModal from './ConfirmModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefsRef = useRef({});
  const [toasts, setToasts] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20; // items per page for 'load more'
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
      // Normalizar status para evitar valores en español o mayúsculas que rompan la UI
      const normalizeStatus = (s) => {
        if (!s) return 'pending';
        const v = String(s).trim().toLowerCase();
        if (v === 'pendiente' || v === 'pending' || v === 'pending_inventory') return 'pending';
        if (v === 'pending_payment' || v === 'pago pendiente') return 'pending_payment';
        if (v === 'completed' || v === 'completado') return 'completed';
        if (v === 'cancelled' || v === 'cancelado') return 'cancelled';
        return v;
      };

      const normalized = ordersData.map(o => ({
        ...o,
        status: normalizeStatus(o.status)
      }));

      setOrders(normalized);

      // Intentar corregir en Firestore los documentos que tengan status no-canonical
      // Limitamos la cantidad de escrituras por carga para evitar operaciones masivas accidentales
      const CANONICAL = new Set(['pending', 'pending_payment', 'completed', 'cancelled']);
      const toFix = ordersData.filter(o => {
        const raw = (o.status || '').toString().trim().toLowerCase();
        return !CANONICAL.has(raw) && normalizeStatus(raw) && normalizeStatus(raw) !== raw;
      }).slice(0, 50); // máximo 50 actualizaciones por ejecución

      if (toFix.length > 0) {
        // helper local para mostrar toasts desde aquí (no dependemos de addToast que se declara más abajo)
        const pushToast = (message, type = 'info') => {
          const id = Date.now() + Math.random();
          setToasts(prev => [...prev, { id, message, type }]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
        };

        let fixedCount = 0;
        for (const o of toFix) {
          try {
            const canonical = normalizeStatus(o.status);
            // Evitar actualizar si ya coincide
            const raw = (o.status || '').toString().trim().toLowerCase();
            if (raw === canonical) continue;

            await updateDoc(doc(db, 'orders', o.id), { status: canonical });
            fixedCount += 1;
          } catch (e) {
            console.warn('No se pudo normalizar status en Firestore para', o.id, e);
            // Si es error de permisos, avisar al admin y no seguir intentando en este ciclo
            const isPerm = e && (e.code === 'permission-denied' || /permission/i.test(e.message || ''));
            if (isPerm) {
              pushToast('Permisos insuficientes para escribir en Firestore. Algunas correcciones no se aplicaron.', 'error');
              break;
            }
          }
        }

        if (fixedCount > 0) pushToast(`Se estandarizaron ${fixedCount} estado(s) de pedido automáticamente.`, 'success');
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Función para reducir el stock de los productos
  const reduceProductStock = async (orderItems) => {
    try {
      // Procesar cada item del pedido
      for (const item of orderItems || []) {
        if (!item || !item.productId) {
          console.warn('Item inválido al reducir stock:', item);
          continue;
        }

        const productRef = doc(db, 'products', item.productId);

        // Obtener el producto actual para verificar stock
        const productSnap = await getDoc(productRef);

        let resolvedProductRef = productRef;
        let resolvedSnap = productSnap;

        // If product doc not found by productId, try fallback keys
        if (!(resolvedSnap && resolvedSnap.exists && resolvedSnap.exists())) {
          // Try using item.id as product id
          if (item.id) {
            const altRef = doc(db, 'products', item.id);
            const altSnap = await getDoc(altRef);
            if (altSnap && altSnap.exists && altSnap.exists()) {
              resolvedProductRef = altRef;
              resolvedSnap = altSnap;
            }
          }
        }

        // If still not found, try to find product by name
        if (!(resolvedSnap && resolvedSnap.exists && resolvedSnap.exists()) && item.name) {
          try {
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const results = await getDocs(q);
            const found = results.docs.find(d => {
              const pdata = d.data();
              return pdata && pdata.name && String(pdata.name).toLowerCase().includes(String(item.name).toLowerCase());
            });
            if (found) {
              resolvedProductRef = doc(db, 'products', found.id);
              resolvedSnap = await getDoc(resolvedProductRef);
            }
          } catch (e) {
            // ignore query errors here
          }
        }

        if (resolvedSnap && resolvedSnap.exists && resolvedSnap.exists()) {
          const currentProduct = resolvedSnap.data();
          const currentStock = Number(currentProduct?.stock || 0);
          const qty = Number(item.quantity || 0);

          // Verificar que hay suficiente stock
          if (currentStock >= qty && qty > 0) {
            // Reducir el stock usando increment con valor negativo
            await updateDoc(resolvedProductRef, {
              stock: increment(-qty),
              updatedAt: new Date()
            });

            console.log(`Stock reducido para ${item.name || item.productId}: ${qty} unidades`);
          } else {
            console.warn(`Stock insuficiente para ${item.name || item.productId}. Stock actual: ${currentStock}, solicitado: ${qty}`);
          }
        } else {
          console.warn(`Producto no encontrado para item: ${JSON.stringify(item)}`);
        }
      }

      console.log('Reducción de stock completada para todos los productos');
      
    } catch (error) {
      console.error('Error reduciendo stock:', error);
      throw error;
    }
  };

  // Actualizar estado del pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const currentOrder = orders.find(order => order.id === orderId);
      const previousStatus = currentOrder?.status;
      
      // Si se está cambiando a 'completed' y no estaba completado antes, reducir stock
      if (newStatus === 'completed' && previousStatus !== 'completed') {
        if (currentOrder?.items) {
          await reduceProductStock(currentOrder.items);
        }
      }
      
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      addToast('Estado del pedido actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      addToast('Error al actualizar estado: ' + (error.message || ''), 'error');
    }
  };

  // Eliminar pedido
  // Confirm modal state for destructive actions
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const performDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter(order => order.id !== orderId));
      addToast('Pedido eliminado', 'success');
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      addToast('Error al eliminar: ' + (error.message || ''), 'error');
    }
  };

  const deleteOrder = (orderId) => {
    setConfirmState({
      open: true,
      title: 'Eliminar pedido',
      message: '¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setConfirmState(s => ({ ...s, open: false }));
        await performDeleteOrder(orderId);
      }
    });
  };

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  // Close menu on outside click or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openMenuId) return;
      const menuEl = menuRefsRef.current[`menu-${openMenuId}`];
      const btnEl = menuRefsRef.current[openMenuId];
      if (menuEl && !menuEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenuId]);

  // Focus the first actionable item when a menu opens
  useEffect(() => {
    if (!openMenuId) return;
    const menuEl = menuRefsRef.current[`menu-${openMenuId}`];
    if (menuEl) {
      const first = menuEl.querySelector('button, select, [tabindex]');
      if (first && typeof first.focus === 'function') first.focus();
    }
  }, [openMenuId]);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Pagination / load-more: show first (page * PAGE_SIZE) items
  const displayedOrders = filteredOrders.slice(0, page * PAGE_SIZE);

  // Derived helpers: location for modal map and subtotal calculation
  const getOrderMapLocation = (order) => {
    if (!order) return null;
    // Prefer customer.location, fallback to shippingAddress.location
    const loc = order.customer?.location || order.shippingAddress?.location || null;
    if (!loc) return null;
    const coords = loc.coordinates || { lat: loc.lat || loc.latitude, lng: loc.lng || loc.longitude };
    const lat = Number(coords?.lat || 0);
    const lng = Number(coords?.lng || coords?.longitude || coords?.longitude || 0);
    // If coordinates are exactly 0,0 treat as absent (likely not selected)
    if (lat === 0 && lng === 0) return null;
    return {
      address: loc.address || loc.addressString || '' ,
      coordinates: { lat, lng }
    };
  };

  const computeSubtotal = (order) => {
    if (!order) return 0;
    // Prefer explicit summary.subtotal
    const sumFromSummary = order.summary?.subtotal;
    if (typeof sumFromSummary === 'number' && !Number.isNaN(sumFromSummary)) return sumFromSummary;

    // Prefer payment.subtotal if present
    const sumFromPayment = order.payment?.subtotal;
    if (typeof sumFromPayment === 'number' && !Number.isNaN(sumFromPayment)) return sumFromPayment;

    // Try payment total - shipping
    const total = Number(order.payment?.total ?? order.summary?.total ?? NaN);
    const shipping = Number(order.payment?.shipping ?? order.summary?.shipping ?? 0);
    if (!Number.isNaN(total)) {
      const calc = total - (Number.isNaN(shipping) ? 0 : shipping);
      if (!Number.isNaN(calc)) return calc;
    }

    // Fallback: sum items price * qty
    const items = order.items || [];
    const itemsSum = items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
    return itemsSum;
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'pending' || s === 'pending_inventory') return 'bg-yellow-100 text-yellow-800';
    if (s === 'pending_payment') return 'bg-orange-100 text-orange-800';
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Obtener ícono del estado
  const getStatusIcon = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'pending' || s === 'pending_inventory') return <Clock className="w-4 h-4" />;
    if (s === 'pending_payment') return <DollarSign className="w-4 h-4" />;
    if (s === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (s === 'cancelled') return <XCircle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  // Obtener texto del estado
  const getStatusText = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'pending' || s === 'pending_inventory' || s === 'pendiente') return 'Pendiente';
    if (s === 'pending_payment' || s === 'pago pendiente') return 'Pago Pendiente';
    if (s === 'completed' || s === 'completado') return 'Completado';
    if (s === 'cancelled' || s === 'cancelado') return 'Cancelado';
    return 'Desconocido';
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

  // Prepare modal derived values
  const modalLocation = selectedOrder ? getOrderMapLocation(selectedOrder) : null;
  const orderForMap = selectedOrder ? { ...selectedOrder, customer: { ...(selectedOrder.customer || {}), location: modalLocation } } : null;
  const selectedSubtotal = selectedOrder ? computeSubtotal(selectedOrder) : 0;
  const selectedShipping = selectedOrder ? Number(selectedOrder.payment?.shipping ?? selectedOrder.summary?.shipping ?? 0) : 0;
  const selectedTotal = selectedOrder ? Number(selectedOrder.payment?.total ?? selectedOrder.summary?.total ?? 0) : 0;

  return (
    <div>
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-60 flex flex-col items-end space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-2 rounded-md shadow-md text-sm ${t.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' : t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-gray-50 text-gray-800 border border-gray-100'}`}>
            {t.message}
          </div>
        ))}
      </div>

      
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

      {/* Mobile: tarjeta por pedido (mejorada para celular) */}
      <div className="md:hidden space-y-3 mb-4">
        {displayedOrders.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-lg shadow-sm">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay pedidos</h3>
            <p className="text-gray-500">{filter === 'all' ? 'No se han realizado pedidos aún.' : `No hay pedidos con estado "${getStatusText(filter)}".`}</p>
          </div>
        ) : (
          displayedOrders.map(order => (
            <article key={order.id} className="bg-white p-4 rounded-lg shadow-sm">
              <header className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{order.orderNumber || order.id.slice(0,8)}</div>
                      <div className="text-xs text-gray-500">{order.items?.length || 0} productos • {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        <span className="sr-only">Estado:</span>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones comprimidas en un menú nativo sin JS adicional */}
                <div className="shrink-0 ml-2 relative">
                  <button
                    aria-haspopup="true"
                    aria-expanded={openMenuId === order.id}
                    onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                    ref={el => { menuRefsRef.current[order.id] = el; }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                    aria-label="Abrir acciones"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>

                  {openMenuId === order.id && (
                    <div
                      role="menu"
                      aria-label="Acciones del pedido"
                      className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                      ref={el => { if (el) { menuRefsRef.current[`menu-${order.id}`] = el; } }}
                    >
                      <div className="py-1">
                        <button role="menuitem" onClick={() => { setOpenMenuId(null); viewOrderDetails(order); }} className="w-full text-left px-3 py-2 text-sm text-cyan-600 hover:bg-gray-50">Ver detalles</button>
                        <div className="px-3 py-2">
                          <label className="block text-xs text-gray-500 mb-1">Cambiar estado</label>
                          <select role="menuitem" value={order.status} onChange={(e) => { updateOrderStatus(order.id, e.target.value); setOpenMenuId(null); }} className="w-full text-sm border rounded px-2 py-1">
                            <option value="pending">Pendiente</option>
                            <option value="pending_payment">Pago Pendiente</option>
                            <option value="completed">Completado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                        <div className="border-t mt-1" />
                        <button role="menuitem" onClick={() => { setOpenMenuId(null); deleteOrder(order.id); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50">Eliminar</button>
                      </div>
                    </div>
                  )}
                </div>

                    
              </header>

              <div className="mt-3 text-sm text-gray-700">
                <div className="font-medium truncate">{order.customerInfo?.fullName || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1"><Phone className="w-3 h-3 mr-1" />{order.customerInfo?.phone || order.customer?.phone}</div>
                <div className="text-sm font-semibold text-gray-900 mt-2">Bs. {order.payment?.total?.toFixed(2) || order.summary?.total?.toFixed(2) || '0.00'}</div>
              </div>
            </article>
          ))
        )}
      </div>

        {/* Desktop / tablet: tabla md+ */}
    <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        {displayedOrders.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber || order.id.slice(0, 8)}</div>
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
                      <div className="text-sm font-medium text-gray-900">{order.customerInfo?.fullName || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()}</div>
                      <div className="text-sm text-gray-500">{order.customerInfo?.email || order.customer?.email}</div>
                      <div className="text-sm text-gray-500 flex items-center"><Phone className="w-3 h-3 mr-1" />{order.customerInfo?.phone || order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Bs. {order.payment?.total?.toFixed(2) || order.summary?.total?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => viewOrderDetails(order)} className="text-cyan-600 hover:text-cyan-900" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="text-xs border rounded px-1 py-1">
                        <option value="pending">Pendiente</option>
                        <option value="pending_payment">Pago Pendiente</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <button onClick={() => deleteOrder(order.id)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

          {/* Load more (desktop/table) */}
          {displayedOrders.length < filteredOrders.length && (
            <div className="hidden md:flex justify-center mt-4">
              <button onClick={() => setPage(p => p + 1)} className="bg-gray-100 px-4 py-2 rounded-md">Cargar más</button>
            </div>
          )}

      {/* Modal de detalles del pedido */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-4 sm:p-6">
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
                    <p><strong>Nombre:</strong> {selectedOrder.customerInfo?.fullName || `${selectedOrder.customer?.firstName || ''} ${selectedOrder.customer?.lastName || ''}`.trim()}</p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedOrder.customerInfo?.email || selectedOrder.customer?.email}
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedOrder.customerInfo?.phone || selectedOrder.customer?.phone}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedOrder.shippingAddress?.address || selectedOrder.customer?.address}, {selectedOrder.shippingAddress?.city || selectedOrder.customer?.city}
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
              {modalLocation && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Ubicación de Entrega</h3>
                  <OrderLocationMap order={orderForMap} />
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
                    <span>Bs. {Number(selectedSubtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Delivery:</span>
                    <span>Bs. {Number(selectedShipping || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>Bs. {Number(selectedTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-gray-600">
                    <span>Método de pago:</span>
                    <span>{selectedOrder.payment?.method || 'No especificado'}</span>
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

      {/* Confirm modal (reusable) */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(s => ({ ...s, open: false }))}
      />
    </div>
  );
};

export default OrderManagement;