import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  Gift,
  Percent,
  Shield,
  Truck
} from 'lucide-react';

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

  // Calcular subtotal, descuentos y total
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99; // Envío gratis por encima de $50
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0; // 10% de descuento
  const total = subtotal + shipping - promoDiscount;

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingBag className="w-8 h-8 text-cyan-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
                <p className="text-gray-600">
                  {getCartItemsCount()} artículo{getCartItemsCount() !== 1 ? 's' : ''} en tu carrito
                </p>
              </div>
            </div>
            <Link 
              to="/catalogo"
              className="text-cyan-600 hover:text-cyan-800 font-medium inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          // Carrito vacío
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
              <div className="bg-white rounded-lg shadow-md">
                {/* Header de la tabla */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
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
                <div className="divide-y divide-gray-200">
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
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen del pedido</h2>
                
                {/* Desglose de precios */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">¡Gratis!</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento (ZAPASTROSO10)</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Cupón de descuento */}
                <div className="mb-6">
                  {!promoApplied && (
                    <div>
                      <button
                        onClick={() => setShowPromoForm(!showPromoForm)}
                        className="w-full text-left text-cyan-600 hover:text-cyan-800 font-medium mb-3 inline-flex items-center"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleApplyPromo}
                            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 font-medium"
                          >
                            Aplicar cupón
                          </button>
                          <p className="text-xs text-gray-500">
                            💡 Tip: Prueba con "ZAPASTROSO10"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Beneficios */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Beneficios incluidos:</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 text-green-600 mr-2" />
                      <span>Envío gratis en pedidos +$50</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Garantía de autenticidad</span>
                    </div>
                    <div className="flex items-center">
                      <Gift className="w-4 h-4 text-purple-600 mr-2" />
                      <span>Devoluciones gratuitas 30 días</span>
                    </div>
                  </div>
                </div>

                {/* Botón de checkout */}
                <Link
                  to="/checkout"
                  className="w-full bg-cyan-600 text-white py-4 rounded-lg hover:bg-cyan-700 font-semibold text-lg inline-flex items-center justify-center transition-colors"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceder al pago
                </Link>

                <p className="text-xs text-gray-500 mt-4 text-center">
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

// Componente para cada item del carrito
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
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

  return (
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {/* Imagen del producto */}
        <div className="shrink-0 w-24 h-24">
          <img
            src={item.imagenPrincipal || '/placeholder-image.jpg'}
            alt={item.nombre}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=';
            }}
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{item.nombre}</h3>
              <p className="text-gray-600">{item.marca}</p>
              <div className="mt-1 space-x-4 text-sm text-gray-500">
                <span>Talla: {item.talla}</span>
                <span>Color: {item.color}</span>
              </div>
              
              {/* Precio */}
              <div className="mt-2">
                {item.descuento > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">
                      ${item.precio.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${item.precioOriginal.toFixed(2)}
                    </span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      -{item.descuento}%
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    ${precio.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Botón eliminar */}
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar producto"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Controles de cantidad y subtotal */}
          <div className="mt-4 flex items-center justify-between">
            {/* Control de cantidad */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-medium min-w-12 text-center">
                  {isUpdating ? '...' : item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isUpdating}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtotal del item */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ${subtotalItem.toFixed(2)}
              </div>
              {item.quantity > 1 && (
                <div className="text-sm text-gray-500">
                  ${precio.toFixed(2)} c/u
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