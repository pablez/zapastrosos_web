import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Tag, Trash2, Plus, Search } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Cargar categorías desde Firestore
  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setError('');
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError('Error al cargar categorías: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      setCategories(categories.filter(c => c.id !== categoryId));
      alert('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error al eliminar categoría: ' + error.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrar categorías
  const filteredCategories = categories.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-cyan-600">{categories.length}</div>
          <div className="text-gray-600 text-sm">Total Categorías</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {categories.filter(c => c.active).length}
          </div>
          <div className="text-gray-600 text-sm">Activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {categories.filter(c => !c.active).length}
          </div>
          <div className="text-gray-600 text-sm">Inactivas</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {categories.length === 0 
                ? 'No hay categorías cargadas. Ve a "Inicializar Datos" para cargar categorías de muestra.'
                : 'No se encontraron categorías con el término de búsqueda.'
              }
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-cyan-100 rounded-lg mr-3">
                      <Tag className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description || 'Sin descripción'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Orden: {category.order || 'N/A'}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => deleteCategory(category.id, category.name)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;