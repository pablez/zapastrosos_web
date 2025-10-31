import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import useThemeListener from '../../hooks/useThemeListener';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  Eye,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItemsCount } = useCart();
  const { theme } = useTheme(); // Agregar tema para forzar re-render
  const totalItems = getCartItemsCount();
  const themeUpdate = useThemeListener(); // Hook para forzar re-render en cambios de tema
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('descripcion');

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productDoc = await getDoc(doc(db, 'products', id));
        
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);
          
          // Seleccionar primera talla y color por defecto
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0]);
          }
        } else {
          setError('Producto no encontrado');
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Manejar compartir producto
  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: `${product.name} - ${product.brand}`,
      text: `¡Mira este increíble producto! ${product.name} por solo $${product.precio}`,
      url: window.location.href
    };

    try {
      // Intentar usar Web Share API (disponible en móviles y algunos navegadores modernos)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('¡Enlace copiado al portapapeles!');
      }
    } catch (error) {
      // Si falla todo, mostrar opciones de compartir manual
      const shareText = encodeURIComponent(`${shareData.text} ${shareData.url}`);
      const shareUrl = encodeURIComponent(shareData.url);
      
      // Crear un menú de opciones
      const shareOptions = [
        {
          name: 'WhatsApp',
          url: `https://wa.me/?text=${shareText}`,
          color: 'bg-green-500'
        },
        {
          name: 'Facebook',
          url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
          color: 'bg-blue-600'
        },
        {
          name: 'Twitter',
          url: `https://twitter.com/intent/tweet?text=${shareText}`,
          color: 'bg-blue-400'
        },
        {
          name: 'Copiar enlace',
          url: null,
          color: 'bg-gray-500'
        }
      ];

      // Mostrar un modal simple con opciones
      const choice = confirm(
        '¿Cómo te gustaría compartir este producto?\n\n' +
        '1. Aceptar para copiar el enlace\n' +
        '2. Cancelar para abrir WhatsApp'
      );

      if (choice) {
        // Copiar al portapapeles
        try {
          await navigator.clipboard.writeText(shareData.url);
          alert('¡Enlace copiado al portapapeles!');
        } catch (clipboardError) {
          // Si no se puede copiar, mostrar el enlace
          prompt('Copia este enlace:', shareData.url);
        }
      } else {
        // Abrir WhatsApp
        window.open(`https://wa.me/?text=${shareText}`, '_blank');
      }
    }
  };

  // Manejar agregar al carrito
  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Por favor selecciona una talla');
      return;
    }
    
    if (!selectedColor && product.colors && product.colors.length > 0) {
      alert('Por favor selecciona un color');
      return;
    }

    // Crear objeto compatible con el contexto del carrito
    const cartProduct = {
      id: product.id,
      nombre: product.name,
      marca: product.brand,
      imagenPrincipalURL: product.mainImageUrl
    };

            // Verificar stock disponible
    const stockDisponible = product.stock || 0;
    if (stockDisponible < quantity) {
      alert(`No hay suficiente stock. Solo quedan ${stockDisponible} unidades disponibles.`);
      return;
    }

    const cartVariant = {
      id: `${selectedSize || 'default'}-${selectedColor || 'default'}`,
      talla: selectedSize || 'Talla única',
      color: selectedColor || 'Color único',
      precio: product.descuento > 0 
        ? product.basePrice * (1 - product.descuento / 100)
        : product.basePrice || 0,
      precioOriginal: product.basePrice || 0,
      descuento: product.descuento || 0,
      stock: stockDisponible
    };    // Agregar múltiples cantidades si es necesario
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct, cartVariant);
    }
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Producto no encontrado'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            El producto que buscas no está disponible en este momento.
          </p>
          <Link 
            to="/catalogo"
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [product.mainImageUrl, ...(product.images || [])].filter(Boolean);

  return (
    <div 
      className="min-h-screen transition-colors duration-300" 
      style={{
        backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
        color: theme === 'dark' ? '#f9fafb' : '#111827'
      }}
    >
      {/* Navegación Responsiva Mejorada */}
      <div 
        className="shadow-lg border-b transition-colors duration-300 sticky top-0 z-50"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center py-4">
            {/* Logo y Breadcrumbs */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-cyan-600 dark:text-cyan-400">
                <div className="bg-cyan-600 text-white p-2 rounded-lg">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <span>Zapastroso</span>
              </Link>
              <nav className="flex items-center space-x-2 text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">Inicio</Link>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <Link to="/catalogo" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">Catálogo</Link>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">{product.name}</span>
              </nav>
            </div>
            
            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle size={20} />
              <Link 
                to="/carrito"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg inline-flex items-center relative transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="font-medium">Carrito</span>
                {totalItems > 0 && (
                  <span className="ml-3 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-3">
            <div className="flex justify-between items-center">
              {/* Mobile Logo and Back Button */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Link 
                  to="/catalogo"
                  className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  title="Volver al catálogo"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to="/" className="flex items-center space-x-2">
                    <div className="bg-cyan-600 text-white p-1.5 rounded-md">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">Zapastroso</span>
                  </Link>
                </div>
              </div>
              
              {/* Mobile Actions */}
              <div className="flex items-center space-x-1">
                <Link 
                  to="/carrito"
                  className="text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 transition duration-300 relative p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Ver carrito"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>
                <div className="p-2">
                  <ThemeToggle size={20} />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${mobileMenuOpen ? 'bg-gray-100 dark:bg-gray-700 text-cyan-600 dark:text-cyan-400' : ''}`}
                  aria-label="Menú de navegación"
                >
                  <div className="relative w-6 h-6">
                    <span className={`absolute top-1.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 transform ${mobileMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
                    <span className={`absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`absolute top-4.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 transform ${mobileMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Product Title Mobile */}
            <div className="mt-3 px-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{product.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{product.brand}</p>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 pb-2">
                <nav className="space-y-2">
                  <Link 
                    to="/" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">🏠</span>
                    <span className="font-medium">Inicio</span>
                  </Link>
                  <Link 
                    to="/catalogo" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">📚</span>
                    <span className="font-medium">Catálogo</span>
                  </Link>
                  <Link 
                    to="/carrito" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="relative">
                      <span className="text-lg">�</span>
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {totalItems > 9 ? '9+' : totalItems}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">
                      Carrito 
                      {totalItems > 0 && <span className="text-cyan-600 dark:text-cyan-400">({totalItems})</span>}
                    </span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Navegación
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 px-3 py-1">
                      Inicio → Catálogo → <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4 order-1 lg:order-1">
            {/* Imagen principal */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={allImages[selectedImage] || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x500?text=Imagen+No+Disponible';
                }}
              />
            </div>

            {/* Miniaturas */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index 
                        ? 'border-cyan-600 dark:border-cyan-400' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} vista ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-2">
            {/* Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    {product.category}
                  </span>
                  {/* Badge de tipo de producto */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.tipo === 'nuevo' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {product.tipo === 'nuevo' ? '✨ Nuevo' : '♻️ Medio Uso'}
                  </span>
                  {/* Badge de descuento */}
                  {product.descuento > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                      -{product.descuento}% OFF
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                    title="Compartir producto"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">{product.brand}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm md:text-base text-gray-600 dark:text-gray-300">(4.8) • 127 reseñas</span>
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {product.descuento > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                    Bs. {(product.basePrice * (1 - product.descuento / 100)).toFixed(2)}
                  </div>
                  <div className="text-lg text-gray-500 line-through">
                    Bs. {product.basePrice?.toFixed(2)}
                  </div>
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                    -{product.descuento}%
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-cyan-600 mb-2">
                  Bs. {product.basePrice?.toFixed(2)}
                </div>
              )}
              
              {product.descuento > 0 && (
                <p className="text-green-600 text-sm font-medium mb-1">
                  ¡Ahorras Bs. {(product.basePrice * product.descuento / 100).toFixed(2)}!
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Precio incluye envío gratis</p>
              
              {/* Información de stock */}
              <div className="mt-3 flex items-center space-x-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {product.stock} unidades en stock
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Sin stock disponible
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">{product.description}</p>
            </div>

            {/* Información del tipo de producto */}
            <div className={`p-3 md:p-4 rounded-lg border-l-4 ${
              product.tipo === 'nuevo' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
            }`}>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {product.tipo === 'nuevo' ? '✨ Producto Nuevo' : '♻️ Producto de Medio Uso'}
              </h3>
              <p className={`text-sm ${
                product.tipo === 'nuevo' 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {product.tipo === 'nuevo' 
                  ? 'Este producto es completamente nuevo, sin uso previo. Incluye garantía completa del fabricante y embalaje original.'
                  : 'Este producto ha sido cuidadosamente inspeccionado y está en excelente estado. Ofrece una gran relación calidad-precio con garantía de satisfacción.'
                }
              </p>
            </div>

            {/* Tallas */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Talla</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 md:py-3 px-2 md:px-4 border rounded-lg text-center font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colores */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-2 px-3 md:px-4 border rounded-lg font-medium transition-colors text-sm md:text-base ${
                        selectedColor === color
                          ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Cantidad</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 md:px-4 py-2 font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                    disabled={quantity >= (product.stock || 0)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col">
                  {product.stock > 0 ? (
                    <>
                      <span className="text-green-600 dark:text-green-400 font-medium text-sm md:text-base">En stock</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Máximo {product.stock} unidades
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-medium text-sm md:text-base">Sin stock</span>
                  )}
                </div>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <div className="mt-2 p-2 md:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    ⚠️ ¡Pocas unidades disponibles! Solo quedan {product.stock} en stock.
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 md:space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock === 0}
                className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-lg font-semibold text-base md:text-lg transition-all inline-flex items-center justify-center ${
                  !product.stock || product.stock === 0
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                {!product.stock || product.stock === 0 ? (
                  <>
                    <X className="w-5 h-5 mr-2" />
                    Sin stock disponible
                  </>
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    ¡Agregado al carrito!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Agregar al carrito
                  </>
                )}
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/cart')}
                  className="flex-1 py-2 md:py-3 px-4 md:px-6 border-2 border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg font-medium transition-all inline-flex items-center justify-center text-sm md:text-base"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver carrito
                </button>
                <button
                  onClick={() => {
                    addToCart({ ...product, quantity, selectedSize, selectedColor });
                    navigate('/cart');
                  }}
                  disabled={!product.stock || product.stock === 0}
                  className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-lg font-medium transition-all inline-flex items-center justify-center text-sm md:text-base ${
                    !product.stock || product.stock === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Comprar ahora
                </button>
              </div>
            </div>

            {/* Contacto del Vendedor */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 md:pt-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Contacto del Vendedor</h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <a 
                  href="https://wa.me/59161625799" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-3 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200 group"
                >
                  {/* Logo de WhatsApp */}
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors duration-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-5 h-5 md:w-6 md:h-6"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-sm md:text-base">Contáctanos por WhatsApp</div>
                    <div className="text-sm md:text-base">+591 61625799</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Etiquetas */}
            {product.tags && product.tags.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs md:text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;