import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { X, Save, Package } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    basePrice: '',
    descuento: 0, // Nuevo campo para descuentos
    stock: '',
    tipo: 'nuevo', // Nuevo campo para tipo de producto
    description: '',
    mainImageUrl: '',
    images: [''],
    sizes: [''],
    colors: [''],
    status: 'activo',
    tags: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar categorías disponibles
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Llenar formulario cuando se edita un producto
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        basePrice: product.basePrice?.toString() || '',
        descuento: product.descuento || 0,
        stock: product.stock?.toString() || '',
        tipo: product.tipo || 'nuevo',
        description: product.description || '',
        mainImageUrl: product.mainImageUrl || '',
        images: product.images?.length ? product.images : [''],
        sizes: product.sizes?.length ? product.sizes : [''],
        colors: product.colors?.length ? product.colors : [''],
        status: product.status || 'activo',
        tags: product.tags?.join(', ') || ''
      });
    } else {
      // Resetear formulario para nuevo producto
      setFormData({
        name: '',
        brand: '',
        category: '',
        basePrice: '',
        descuento: 0,
        stock: '',
        tipo: 'nuevo',
        description: '',
        mainImageUrl: '',
        images: [''],
        sizes: [''],
        colors: [''],
        status: 'activo',
        tags: ''
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.brand.trim()) newErrors.brand = 'La marca es requerida';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (!formData.basePrice || isNaN(formData.basePrice) || formData.basePrice <= 0) {
      newErrors.basePrice = 'El precio debe ser un número válido mayor a 0';
    }
    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser un número válido mayor o igual a 0';
    }
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        basePrice: parseFloat(formData.basePrice),
        descuento: parseInt(formData.descuento) || 0,
        stock: parseInt(formData.stock),
        tipo: formData.tipo,
        description: formData.description.trim(),
        mainImageUrl: formData.mainImageUrl.trim(),
        images: formData.images.filter(img => img.trim() !== ''),
        sizes: formData.sizes.filter(size => size.trim() !== ''),
        colors: formData.colors.filter(color => color.trim() !== ''),
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        updatedAt: new Date()
      };

      if (product) {
        // Actualizar producto existente
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        // Crear nuevo producto
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en arrays (images, sizes, colors)
  const handleArrayChange = (arrayName, index, value) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = value;
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName) => {
    setFormData({
      ...formData,
      [arrayName]: [...formData[arrayName], '']
    });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArray });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-2 text-cyan-600" />
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Zapatos deportivos Nike Air Max"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Nike"
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.basePrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Descuento en porcentaje (0-100). 
                  {formData.descuento > 0 && formData.basePrice && (
                    <span className="text-green-600 font-medium">
                      {' '}Precio con descuento: Bs. {(parseFloat(formData.basePrice) * (1 - parseFloat(formData.descuento) / 100)).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Disponible *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                <p className="text-gray-500 text-xs mt-1">Cantidad de unidades disponibles para venta</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Producto *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="medio uso">Medio Uso</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">Selecciona si el producto es nuevo o de medio uso</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Descripción e imágenes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Descripción e Imágenes</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descripción detallada del producto..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen Principal (URL)
                </label>
                <input
                  type="url"
                  value={formData.mainImageUrl}
                  onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="deportivo, cómodo, casual"
                />
              </div>
            </div>
          </div>

          {/* Arrays: Tallas, Colores, Imágenes adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tallas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tallas Disponibles
              </label>
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => handleArrayChange('sizes', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Ej: 42"
                  />
                  {formData.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('sizes', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('sizes')}
                className="text-cyan-600 hover:text-cyan-800 text-sm"
              >
                + Agregar talla
              </button>
            </div>

            {/* Colores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colores Disponibles
              </label>
              {formData.colors.map((color, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handleArrayChange('colors', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Ej: Negro"
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('colors', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('colors')}
                className="text-cyan-600 hover:text-cyan-800 text-sm"
              >
                + Agregar color
              </button>
            </div>

            {/* Imágenes adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes Adicionales (URLs)
              </label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleArrayChange('images', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('images', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('images')}
                className="text-cyan-600 hover:text-cyan-800 text-sm"
              >
                + Agregar imagen
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {product ? 'Actualizar' : 'Crear'} Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;