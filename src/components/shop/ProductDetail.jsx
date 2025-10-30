import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useCart } from '../../contexts/CartContext';
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
  Plus
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItemsCount } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const totalItems = getCartItemsCount();

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
      precio: product.basePrice || 0,
      precioOriginal: product.basePrice || 0,
      descuento: 0,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Producto no encontrado'}
          </h1>
          <p className="text-gray-600 mb-6">
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
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700">Inicio</Link>
              <span className="text-gray-400">/</span>
              <Link to="/catalogo" className="text-gray-500 hover:text-gray-700">Catálogo</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                to="/carrito"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 inline-flex items-center relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrito
                {totalItems > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={allImages[selectedImage] || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2NjYyIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==';
                }}
              />
            </div>

            {/* Miniaturas */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index 
                        ? 'border-cyan-600' 
                        : 'border-gray-200 hover:border-gray-300'
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
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.category}
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl text-gray-600">{product.brand}</p>
              
              <div className="flex items-center mt-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-600">(4.8) • 127 reseñas</span>
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-cyan-600">
                Bs. {product.basePrice?.toFixed(2)}
              </div>
              <p className="text-gray-600 text-sm mt-1">Precio incluye envío gratis</p>
              
              {/* Información de stock */}
              <div className="mt-3 flex items-center space-x-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">
                      {product.stock} unidades en stock
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 font-medium">
                      Sin stock disponible
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Tallas */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Talla</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border rounded-lg text-center font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 hover:border-gray-400'
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-2 px-4 border rounded-lg font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 hover:border-gray-400'
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cantidad</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                    disabled={quantity >= (product.stock || 0)}
                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col">
                  {product.stock > 0 ? (
                    <>
                      <span className="text-green-600 font-medium">En stock</span>
                      <span className="text-xs text-gray-500">
                        Máximo {product.stock} unidades
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 font-medium">Sin stock</span>
                  )}
                </div>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ ¡Pocas unidades disponibles! Solo quedan {product.stock} en stock.
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock === 0}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all inline-flex items-center justify-center ${
                  !product.stock || product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                {!product.stock || product.stock === 0 ? (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
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
              
              <button 
                onClick={() => navigate('/carrito')}
                className="w-full py-4 px-6 border border-gray-300 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Ver carrito
              </button>
            </div>

            {/* Beneficios */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficios</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Truck className="w-5 h-5 text-green-600 mr-3" />
                  <span>Envío gratis en pedidos superiores a $50</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <RotateCcw className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Devoluciones gratuitas hasta 30 días</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Shield className="w-5 h-5 text-purple-600 mr-3" />
                  <span>Garantía de autenticidad del producto</span>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {product.tags && product.tags.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
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