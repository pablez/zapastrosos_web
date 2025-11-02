import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Package, Edit, Trash2, Plus, Search, Filter, Eye } from 'lucide-react';
import ProductModal from './ProductModal';
import ProductDetailModal from './ProductDetailModal';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState('');
  
  // Estados para modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cargar productos desde Firestore
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setError('');
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('Error al cargar productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId, productName) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(p => p.id !== productId));
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  // Alternar estado del producto
  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
      await updateDoc(doc(db, 'products', productId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar estado: ' + error.message);
    }
  };

  // Funciones para manejar modales
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsProductModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    loadProducts(); // Recargar la lista de productos
    handleCloseModals();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const FALLBACK_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=';

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        <button 
          onClick={handleCreateProduct}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadProducts}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 inline-flex items-center justify-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Recargar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-cyan-600">{products.length}</div>
          <div className="text-gray-600 text-sm">Total Productos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.status === 'activo').length}
          </div>
          <div className="text-gray-600 text-sm">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => p.status === 'inactivo').length}
          </div>
          <div className="text-gray-600 text-sm">Inactivos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-500">
            {products.filter(p => (p.stock || 0) <= 5 && p.status === 'activo').length}
          </div>
          <div className="text-gray-600 text-sm">Stock Crítico</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-500">
            {products.filter(p => (p.stock || 0) > 5 && (p.stock || 0) <= 20 && p.status === 'activo').length}
          </div>
          <div className="text-gray-600 text-sm">Stock Bajo</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
          <div className="text-gray-600 text-sm">Categorías</div>
        </div>
      </div>

      {/* Products: mobile cards (md:hidden) and table for md+ */}
      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mb-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-500">
            {products.length === 0
              ? 'No hay productos cargados. Usa el botón "Nuevo Producto" para crear uno.'
              : 'No se encontraron productos con los filtros aplicados.'}
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start space-x-3">
                <img
                  src={product.mainImageUrl || FALLBACK_SVG}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover shrink-0"
                  onError={(e) => { e.target.src = FALLBACK_SVG; }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">ID: {product.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">Bs. {product.basePrice?.toFixed(2) || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-medium ${
                        (product.stock || 0) <= 5 ? 'text-red-600' : 
                        (product.stock || 0) <= 20 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock !== undefined ? `${product.stock} unidades` : 'N/A'}
                      </div>
                      {(product.stock || 0) <= 5 && product.stock !== undefined && (
                        <div className="text-xs text-red-500">Stock bajo</div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleViewProduct(product)} className="text-blue-600" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditProduct(product)} className="text-yellow-600" title="Editar"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(product.id, product.name)} className="text-red-600" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / tablet table (hidden on small screens) */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {products.length === 0 
                      ? 'No hay productos cargados. Usa el botón "Nuevo Producto" para crear uno.'
                      : 'No se encontraron productos con los filtros aplicados.'
                    }
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.mainImageUrl || FALLBACK_SVG}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = FALLBACK_SVG;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Bs. {product.basePrice?.toFixed(2) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        (product.stock || 0) <= 5 ? 'text-red-600' : 
                        (product.stock || 0) <= 20 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock !== undefined ? product.stock : 'N/A'}
                        {product.stock !== undefined && (
                          <span className="text-xs text-gray-500 ml-1">unidades</span>
                        )}
                      </div>
                      {(product.stock || 0) <= 5 && product.stock !== undefined && (
                        <div className="text-xs text-red-500">Stock bajo</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.status)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'activo'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {product.status === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id, product.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseModals}
        product={editingProduct}
        onSave={handleProductSaved}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductManagement;