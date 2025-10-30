import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Filter, Grid, List, Star, ShoppingCart, Check, Percent, Sparkles, Recycle } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const ProductCatalog = () => {
  const { getCartItemsCount } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [showOfertas, setShowOfertas] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  const totalItems = getCartItemsCount();

  // Leer parámetros de URL al cargar
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    const ofertas = searchParams.get('ofertas');
    
    if (tipo) {
      setSelectedTipo(tipo);
    }
    if (ofertas === 'true') {
      setShowOfertas(true);
    }
  }, [searchParams]);

  // Cargar productos y categorías
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar productos
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(product => product.status === 'activo'); // Solo productos activos
        
        // Cargar categorías
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsData);
        setCategories(categoriesData);
        setError('');
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar los productos. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesTipo = selectedTipo === 'all' || product.tipo === selectedTipo;
      const matchesOfertas = !showOfertas || (product.descuento && product.descuento > 0);
      
      return matchesSearch && matchesCategory && matchesTipo && matchesOfertas;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.basePrice || 0) - (b.basePrice || 0);
        case 'price-high':
          return (b.basePrice || 0) - (a.basePrice || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '');
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Cargando catálogo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Productos</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? 's' : ''} disponible{filteredAndSortedProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle size={20} />
            <Link 
              to="/carrito"
              className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 inline-flex items-center relative transition-colors duration-300"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrito
              {totalItems > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <Link 
              to="/"
              className="text-cyan-600 hover:text-cyan-800 font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por categoría */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por tipo */}
            <div className="relative">
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="nuevo">Zapatos Nuevos</option>
                <option value="medio uso">Medio Uso</option>
              </select>
            </div>

            {/* Filtro de ofertas */}
            <div className="relative">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOfertas}
                  onChange={(e) => setShowOfertas(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Solo ofertas</span>
                <Percent className="w-4 h-4 text-red-500" />
              </label>
            </div>

            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="brand">Ordenar por marca</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
            </select>

            {/* Vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 flex items-center justify-center ${
                  viewMode === 'grid' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 flex items-center justify-center ${
                  viewMode === 'list' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista/Grid de productos */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {products.length === 0 ? 'No hay productos disponibles' : 'No se encontraron productos'}
            </h2>
            <p className="text-gray-600 mb-6">
              {products.length === 0 
                ? 'Los productos aparecerán aquí una vez que el administrador los agregue.'
                : 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.'
              }
            </p>
            {searchTerm || selectedCategory !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
          }>
            {filteredAndSortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para tarjeta de producto
const ProductCard = ({ product, viewMode }) => {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    // Crear producto y variante compatible con el contexto del carrito
    const cartProduct = {
      id: product.id,
      nombre: product.name,
      marca: product.brand,
      imagenPrincipalURL: product.mainImageUrl
    };

    const finalPrice = product.descuento && product.descuento > 0 
      ? product.basePrice * (1 - product.descuento / 100)
      : product.basePrice;

    const cartVariant = {
      id: `${product.id}-default`,
      color: product.colors?.[0] || 'Color único',
      talla: product.sizes?.[0] || 'Talla única',
      precio: finalPrice,
      precioOriginal: product.basePrice || 0,
      descuento: product.descuento || 0,
      stock: product.stock || 0
    };

    addToCart(cartProduct, cartVariant);
    setAddedToCart(true);
    
    setTimeout(() => setAddedToCart(false), 2000);
  };
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex gap-6">
            {/* Imagen */}
            <div className="shrink-0 w-32 h-32">
              <img
                src={product.mainImageUrl || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0iI2NjYyIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==';
                }}
              />
            </div>

            {/* Información */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400">
                    <Link to={`/producto/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600">{product.brand}</p>
                </div>
                <div className="text-right">
                  {product.descuento && product.descuento > 0 ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-red-600">
                          Bs. {(product.basePrice * (1 - product.descuento / 100)).toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                          -{product.descuento}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        Bs. {product.basePrice?.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-cyan-600">
                      Bs. {product.basePrice?.toFixed(2) || 'N/A'}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                  {product.sizes && product.sizes.length > 0 && (
                    <span className="text-sm text-gray-600">
                      Tallas: {product.sizes.slice(0, 3).join(', ')}
                      {product.sizes.length > 3 && '...'}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/producto/${product.id}`}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Ver detalles
                  </Link>
                  <button 
                    onClick={handleAddToCart}
                    className={`bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors inline-flex items-center ${
                      addedToCart ? 'bg-green-600' : ''
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        ¡Agregado!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista en grid
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Imagen */}
      <div className="aspect-square overflow-hidden">
        <img
          src={product.mainImageUrl || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjYyIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==';
          }}
        />
      </div>

      {/* Información */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 line-clamp-1">
            <Link to={`/producto/${product.id}`}>
              {product.name}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm">{product.brand}</p>
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col space-y-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.category}
            </span>
            {product.tipo && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                product.tipo === 'nuevo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.tipo === 'nuevo' ? 'Nuevo' : 'Medio Uso'}
              </span>
            )}
          </div>
          {product.descuento && product.descuento > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              -{product.descuento}%
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="mb-3">
          {product.descuento && product.descuento > 0 ? (
            <div>
              <div className="text-lg font-bold text-red-600">
                Bs. {(product.basePrice * (1 - product.descuento / 100)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 line-through">
                Bs. {product.basePrice?.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-cyan-600">
              Bs. {product.basePrice?.toFixed(2) || 'N/A'}
            </div>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600">
              Tallas: {product.sizes.slice(0, 4).join(', ')}
              {product.sizes.length > 4 && '...'}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Link
            to={`/producto/${product.id}`}
            className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
          >
            Ver detalles
          </Link>
          <button 
            onClick={handleAddToCart}
            className={`flex-1 bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 transition-colors inline-flex items-center justify-center text-sm ${
              addedToCart ? 'bg-green-600' : ''
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;