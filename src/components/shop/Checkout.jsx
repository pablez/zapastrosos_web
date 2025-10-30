import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CreditCard, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Truck,
  Shield,
  Clock,
  Check,
  Smartphone,
  QrCode,
  Copy,
  AlertCircle
} from 'lucide-react';
import YapeQRCode from './YapeQRCode';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, getCartItemsCount, clearCart } = useCart();
  const { user } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'yape' // 'yape', 'card', 'cash'
  });
  
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showYapeQR, setShowYapeQR] = useState(false);

  // Calcular totales
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  // Redireccionar si no hay productos en el carrito
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/carrito');
    }
  }, [items, orderComplete, navigate]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Nombre requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Apellido requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pedido
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Crear objeto del pedido
      const orderData = {
        userId: user ? user.uid : null, // Usuario autenticado o null para invitados
        orderNumber: `ZAP-${Date.now()}`,
        customerType: user ? 'registered' : 'guest', // Tipo de cliente
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        items: items.map(item => ({
          productId: item.tenisId,
          name: item.nombre,
          brand: item.marca,
          size: item.talla,
          color: item.color,
          quantity: item.quantity,
          price: item.precio,
          subtotal: item.precio * item.quantity
        })),
        summary: {
          subtotal: subtotal,
          shipping: shipping,
          total: total
        },
        paymentMethod: formData.paymentMethod,
        status: formData.paymentMethod === 'yape' ? 'pending_payment' : 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Intentando crear pedido:', { 
        userId: user ? user.uid : 'invitado',
        orderData: orderData 
      });
      
      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('Pedido creado exitosamente:', docRef.id);
      setOrderId(docRef.id);
      
      if (formData.paymentMethod === 'yape') {
        setShowYapeQR(true);
      } else {
        // Para otros métodos de pago, completar inmediatamente
        setOrderComplete(true);
        clearCart();
      }
      
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('Error al procesar el pedido. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmar pago con Yape
  const handleYapePaymentConfirm = () => {
    setOrderComplete(true);
    clearCart();
    setShowYapeQR(false);
  };

  // Copiar número de Yape
  const copyYapeNumber = () => {
    navigator.clipboard.writeText('987654321');
    alert('Número copiado al portapapeles');
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu pedido #{orderId.slice(-8)} ha sido procesado exitosamente.
            Recibirás un email de confirmación en breve.
          </p>
          <div className="space-y-3">
            <Link
              to="/catalogo"
              className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 inline-flex items-center justify-center font-medium"
            >
              Seguir comprando
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 inline-flex items-center justify-center font-medium"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showYapeQR) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagar con Yape
            </h1>
            <p className="text-gray-600">
              Escanea el código QR o usa el número para pagar
            </p>
          </div>

          {/* QR Code (imagen estática basada en tu imagen) */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-purple-800">Yape</span>
              </div>
            </div>
            
            {/* QR Code estático */}
            <YapeQRCode />
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Escanea este QR para pagar a:</p>
              <p className="font-bold text-gray-900">Gerardo Pablo Moya Grageda</p>
              <p className="text-sm text-gray-500 mb-4">Vencimiento: 30 Oct 2027</p>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">O yapea al número:</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="font-mono text-lg font-bold">987-654-321</span>
                  <button
                    onClick={copyYapeNumber}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Copiar número"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Información del pago */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 mb-1">
                  Monto a pagar: S/ {total.toFixed(2)}
                </h3>
                <p className="text-sm text-yellow-700">
                  Una vez realizado el pago, confirma para continuar con tu pedido.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleYapePaymentConfirm}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium"
            >
              Ya realicé el pago
            </button>
            <button
              onClick={() => setShowYapeQR(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cambiar método de pago
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CreditCard className="w-8 h-8 text-cyan-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
                <p className="text-gray-600">
                  {getCartItemsCount()} producto{getCartItemsCount() !== 1 ? 's' : ''} • Total: ${total.toFixed(2)}
                </p>
              </div>
            </div>
            <Link 
              to="/carrito"
              className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2">
            
            {/* Mensaje para usuarios invitados */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      Compra como invitado
                    </h3>
                    <p className="text-sm text-blue-700">
                      Puedes realizar tu pedido sin crear una cuenta. Si quieres guardar tu información para futuras compras, 
                      <Link to="/login" className="text-blue-800 font-medium hover:underline ml-1">
                        inicia sesión aquí
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Información personal */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-cyan-600" />
                  Información Personal
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tu nombre"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tu apellido"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+51 999 999 999"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-cyan-600" />
                  Dirección de Envío
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Av. Principal 123, Dpto 456"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Lima"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="15001"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-cyan-600" />
                  Método de Pago
                </h2>
                
                <div className="space-y-4">
                  {/* Yape */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="yape"
                      checked={formData.paymentMethod === 'yape'}
                      onChange={handleInputChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3 flex items-center">
                      <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">Yape</p>
                        <p className="text-sm text-gray-500">Pago inmediato con QR</p>
                      </div>
                    </div>
                    <span className="ml-auto bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      Recomendado
                    </span>
                  </label>
                  
                  {/* Tarjeta de crédito */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-500">Tarjeta de Crédito/Débito</p>
                        <p className="text-sm text-gray-400">Próximamente disponible</p>
                      </div>
                    </div>
                  </label>
                  
                  {/* Pago contra entrega */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      disabled
                      className="text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="ml-3 flex items-center">
                      <Truck className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-500">Pago contra entrega</p>
                        <p className="text-sm text-gray-400">Próximamente disponible</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
              
              {/* Productos */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.tenisId}-${item.variantId}`} className="flex items-center space-x-3">
                    <div className="shrink-0 w-12 h-12">
                      <img
                        src={item.imagenPrincipal || '/placeholder-image.jpg'}
                        alt={item.nombre}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                      <p className="text-xs text-gray-500">{item.talla} • {item.color}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.precio * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-2 pb-4 border-b border-gray-200">
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
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Beneficios */}
              <div className="mt-6 mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Tu pedido incluye:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    <span>Garantía de autenticidad</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Envío {shipping === 0 ? 'gratis' : 'estándar'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Entrega en 3-5 días hábiles</span>
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmitOrder}
                disabled={isProcessing}
                className="w-full bg-cyan-600 text-white py-4 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  `Pagar $${total.toFixed(2)}`
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Al realizar el pedido, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;