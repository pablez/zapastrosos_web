import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  Percent,
  Truck
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const Cart = () => {
  const { 
    items, 
    getCartTotal, 
    getCartItemsCount, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);

  // Verificar si hay problemas de stock
  const hasStockIssues = items.some(item => 
    !item.stock || item.stock === 0 || item.quantity > item.stock
  );

  // Calcular subtotal, descuentos y total
  const subtotal = getCartTotal();
  const shipping = subtotal > 200 ? 0 : 15; // Envío gratis por encima de Bs. 200
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0; // 10% de descuento
  const total = subtotal + shipping - promoDiscount;

  const FALLBACK_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=';

  // Manejar aplicar cupón
  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'zapastroso10') {
      setPromoApplied(true);
      setShowPromoForm(false);
      alert('¡Cupón aplicado! 10% de descuento');
    } else {
      alert('Cupón inválido');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header - Responsive */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingBag className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Carrito de Compras</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {getCartItemsCount()} artículo{getCartItemsCount() !== 1 ? 's' : ''} en tu carrito
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle size={20} />
              <Link 
                to="/catalogo"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link 
                  to="/catalogo"
                  className="text-cyan-600 hover:text-cyan-800 p-2"
                  title="Seguir comprando"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Mi Carrito</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getCartItemsCount()} productos
                  </p>
                </div>
              </div>
              <ThemeToggle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          // Carrito vacío
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center transition-colors duration-300">
            <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Parece que no has agregado ningún producto a tu carrito. 
              ¡Explora nuestro catálogo y encuentra tus zapatos favoritos!
            </p>
            <div className="space-y-4">
              <Link 
                to="/catalogo"
                className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 inline-flex items-center font-semibold"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Explorar catálogo
              </Link>
              <div className="text-center">
                <Link 
                  to="/"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Carrito con productos
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
                {/* Header de la tabla */}
                <div className="border-b border-gray-200 dark:border-gray-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Productos ({getCartItemsCount()})
                    </h2>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                          clearCart();
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {items.map((item) => (
                    <CartItem 
                      key={`${item.tenisId}-${item.variantId}`}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Resumen del pedido</h2>
                
                {/* Desglose de precios */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>Bs. {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Envío</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">¡Gratis!</span>
                      ) : (
                        `Bs. ${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuento (ZAPASTROSO10)</span>
                      <span>-Bs. {promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t dark:border-gray-600 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>Bs. {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Cupón de descuento */}
                <div className="mb-6">
                  {!promoApplied && (
                    <div>
                      <button
                        onClick={() => setShowPromoForm(!showPromoForm)}
                        className="w-full text-left text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium mb-3 inline-flex items-center"
                      >
                        <Percent className="w-4 h-4 mr-2" />
                        ¿Tienes un cupón de descuento?
                      </button>
                      
                      {showPromoForm && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Código de cupón"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleApplyPromo}
                            className="w-full bg-gray-600 dark:bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 font-medium"
                          >
                            Aplicar cupón
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            💡 Tip: Prueba con "ZAPASTROSO10"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Beneficios */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Beneficios incluidos:</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      <span>Envío gratis en pedidos +Bs. 200</span>
                    </div>
                  </div>
                </div>

                {/* Botón de checkout */}
                <Link
                  to={hasStockIssues ? '#' : '/checkout'}
                  onClick={(e) => {
                    if (hasStockIssues) {
                      e.preventDefault();
                      alert('Por favor, ajusta las cantidades de los productos con problemas de stock antes de continuar.');
                    }
                  }}
                  className={`w-full py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center transition-colors ${
                    hasStockIssues 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {hasStockIssues ? 'Revisar stock' : 'Proceder al pago'}
                </Link>

                {hasStockIssues && (
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      ⚠️ Algunos productos tienen problemas de stock. Ajusta las cantidades antes de continuar.
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Pago 100% seguro y protegido
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para cada item del carrito - Mejorado y Responsivo
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    // Verificar stock disponible
    const stockDisponible = item.stock || 0;
    if (newQuantity > stockDisponible) {
      alert(`No hay suficiente stock. Solo hay ${stockDisponible} unidades disponibles.`);
      return;
    }
    
    setIsUpdating(true);
    await onUpdateQuantity(item.tenisId, item.variantId, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = () => {
    if (confirm(`¿Eliminar "${item.nombre}" del carrito?`)) {
      onRemove(item.tenisId, item.variantId);
    }
  };

  const precio = item.descuento > 0 ? item.precio : (item.precioOriginal || item.precio);
  const subtotalItem = precio * item.quantity;
  const stockDisponible = item.stock || 0;
  const stockInsuficiente = item.quantity > stockDisponible;

  return (
    <div className={`p-4 sm:p-6 transition-colors duration-300 ${
      stockInsuficiente 
        ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
    }`}>
      {/* Alerta de stock insuficiente */}
      {stockInsuficiente && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400 font-medium text-sm flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              Stock insuficiente: Solo hay {stockDisponible} unidades disponibles
            </div>
          </div>
        </div>
      )}
      
      {/* Layout Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Imagen del producto - Responsiva */}
        <div className="shrink-0 w-full sm:w-24 md:w-32 lg:w-36">
          <div className="aspect-square w-full sm:w-24 md:w-32 lg:w-36 mx-auto sm:mx-0">
            <img
              src={item.imagenPrincipal || FALLBACK_SVG}
              alt={item.nombre}
              className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              onError={(e) => {
                e.target.src = FALLBACK_SVG;
              }}
            />
          </div>
        </div>

        {/* Información del producto - Layout Mejorado */}
        <div className="flex-1 min-w-0">
          {/* Header con título y botón eliminar */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white leading-tight truncate">
                {item.nombre}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                {item.marca}
              </p>
            </div>
            
            {/* Botón eliminar - Mejorado */}
            <button
              onClick={handleRemove}
              className="shrink-0 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Eliminar producto"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Detalles del producto - Grid Responsivo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 text-sm">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">Talla</span>
              <span className="font-semibold text-gray-900 dark:text-white">{item.talla}</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">Color</span>
              <span className="font-semibold text-gray-900 dark:text-white">{item.color}</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">Stock</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  stockDisponible === 0 ? 'bg-red-500' :
                  stockDisponible <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className={`text-xs font-semibold ${
                  stockDisponible === 0 ? 'text-red-600 dark:text-red-400' :
                  stockDisponible <= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {stockDisponible}
                </span>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">Estado</span>
              <span className={`text-xs font-semibold ${
                item.tipo === 'nuevo' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
              }`}>
                {item.tipo === 'nuevo' ? 'Nuevo' : 'Medio Uso'}
              </span>
            </div>
          </div>
              
          {/* Precio - Mejorado y Responsivo */}
          <div className="mb-4 p-3 bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800">
            {item.descuento > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                  Bs. {item.precio.toFixed(2)}
                </span>
                <span className="text-sm md:text-base text-gray-500 dark:text-gray-400 line-through">
                  Bs. {item.precioOriginal.toFixed(2)}
                </span>
                <span className="inline-flex items-center text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                  <Percent className="w-3 h-3 mr-1" />
                  -{item.descuento}%
                </span>
              </div>
            ) : (
              <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Bs. {precio.toFixed(2)}
              </span>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Precio por unidad</p>
          </div>

          {/* Controles de cantidad y subtotal - Layout Responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-t border-gray-200 dark:border-gray-600 pt-4">
            {/* Control de cantidad - Mejorado */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Cantidad:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold min-w-16 text-center text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">
                  {isUpdating ? '...' : item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating || item.quantity >= stockDisponible}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-r-lg"
                  title={item.quantity >= stockDisponible ? "Stock máximo alcanzado" : "Aumentar cantidad"}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtotal del item - Destacado */}
            <div className="text-center sm:text-right">
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Bs. {subtotalItem.toFixed(2)}
              </div>
              {item.quantity > 1 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Bs. {precio.toFixed(2)} × {item.quantity}
                </div>
              )}
              {stockInsuficiente && (
                <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1 animate-pulse">
                  ⚠️ Ajustar cantidad
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;