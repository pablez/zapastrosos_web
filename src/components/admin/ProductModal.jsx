import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { X, Save, Package } from 'lucide-react';
import { checkImageKitAvailability, uploadPaymentProofToImageKit, uploadFileToImageKitWithProgress, validateFile } from '../../services/imagekitService';

const ProductModal = ({ isOpen, onClose, product = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    basePrice: '',
    purchaseCost: '',
    descuento: 0, // Nuevo campo para descuentos
    stock: '',
    tipo: 'nuevo', // Nuevo campo para tipo de producto
    description: '',
    mainImageUrl: '',
  images: [],
  // files to upload
  mainImageFile: null,
  imageFiles: [],
    sizes: [''],
    colors: [''],
    status: 'activo',
    tags: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // UI states for improved UX
  const [isDragging, setIsDragging] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(!!product);
  const nameRef = useRef(null);
  const [mainDragging, setMainDragging] = useState(false);
  const mainInputRef = useRef(null);
  // Previews for selected local files
  const [previews, setPreviews] = useState({ main: null, images: [] });
  // Upload progress for files (keyed by index or 'main')
  const [uploadProgress, setUploadProgress] = useState({});

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
        purchaseCost: product.purchaseCost?.toString() || '',
        descuento: product.descuento || 0,
        stock: product.stock?.toString() || '',
        tipo: product.tipo || 'nuevo',
        description: product.description || '',
  mainImageUrl: product.mainImageUrl || '',
  images: product.images?.length ? product.images : [],
  mainImageFile: null,
  imageFiles: [],
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
        purchaseCost: '',
        descuento: 0,
        stock: '',
        tipo: 'nuevo',
        description: '',
        mainImageUrl: '',
  images: [],
  mainImageFile: null,
  imageFiles: [],
        sizes: [''],
        colors: [''],
        status: 'activo',
        tags: ''
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // Autofocus name when creating a new product
  useEffect(() => {
    if (isOpen && !product) {
      try { nameRef.current?.focus(); } catch (e) {}
    }
  }, [isOpen, product]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.brand.trim()) newErrors.brand = 'La marca es requerida';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (!formData.basePrice || isNaN(formData.basePrice) || formData.basePrice <= 0) {
      newErrors.basePrice = 'El precio debe ser un número válido mayor a 0';
    }
    if (formData.purchaseCost === '' || isNaN(formData.purchaseCost) || Number(formData.purchaseCost) < 0) {
      newErrors.purchaseCost = 'El costo de compra debe ser un número válido mayor o igual a 0';
    }
    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser un número válido mayor o igual a 0';
    }
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';

    // Validate main image file if provided
    if (formData.mainImageFile) {
      const v = validateFile(formData.mainImageFile);
      if (!v.isValid) newErrors.mainImageFile = v.error;
      else if (!formData.mainImageFile.type.startsWith('image/')) newErrors.mainImageFile = 'El archivo principal debe ser una imagen (PNG/JPG)';
    }

    // Validate additional image files
    for (const f of formData.imageFiles || []) {
      if (!f) continue;
      const v2 = validateFile(f);
      if (!v2.isValid) {
        newErrors.imageFiles = v2.error;
        break;
      }
      if (!f.type.startsWith('image/')) {
        newErrors.imageFiles = 'Las imágenes adicionales deben ser PNG/JPG';
        break;
      }
    }

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
        purchaseCost: parseFloat(formData.purchaseCost) || 0,
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

      let productId = product ? product.id : null;

      if (product) {
        // Actualizar producto existente (no tocamos URLs aún)
        await updateDoc(doc(db, 'products', productId), productData);
      } else {
        // Crear nuevo producto (sin imágenes por ahora)
        productData.createdAt = new Date();
        const ref = await addDoc(collection(db, 'products'), productData);
        productId = ref.id;
      }

      // Si ImageKit está disponible y hay archivos seleccionados, subirlos y actualizar doc
      if (checkImageKitAvailability()) {
        const updates = {};
        // Main image (with progress)
        if (formData.mainImageFile) {
          try {
            setUploadProgress(prev => ({ ...prev, main: 0 }));
            const up = await uploadFileToImageKitWithProgress(formData.mainImageFile, 'admin', productId, (p) => setUploadProgress(prev => ({ ...prev, main: p })));
            updates.mainImageUrl = up.url;
            setUploadProgress(prev => ({ ...prev, main: 100 }));
          } catch (err) {
            console.error('Error subiendo imagen principal:', err);
            // continuar sin abortar
          }
        }

        // Additional images: subir nuevos archivos y agregar sus URLs a las existentes
        if ((formData.imageFiles || []).length > 0) {
          const urls = [];
          for (let idx = 0; idx < formData.imageFiles.length; idx++) {
            const f = formData.imageFiles[idx];
            if (!f) continue;
            try {
              // initialize progress for this index
              setUploadProgress(prev => ({ ...prev, [idx]: 0 }));
              const upf = await uploadFileToImageKitWithProgress(f, 'admin', productId, (p) => setUploadProgress(prev => ({ ...prev, [idx]: p })));
              urls.push(upf.url);
              setUploadProgress(prev => ({ ...prev, [idx]: 100 }));
            } catch (e) {
              console.error('Error subiendo imagen adicional:', e);
            }
          }
          if (urls.length > 0) updates.images = [...(productData.images || []), ...urls];
        }

        // Aplicar actualizaciones si hay URLs
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'products', productId), { ...updates, updatedAt: new Date() });
        }
      } else {
        // ImageKit no configurado: si se proporcionaron archivos, avisar al admin
        if (formData.mainImageFile || (formData.imageFiles || []).length > 0) {
          alert('ImageKit no está configurado. Las imágenes no fueron subidas. Configura las variables de entorno para habilitarlo.');
        }
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

  // File handlers for images
  const handleMainImageFile = (e) => {
    const f = e.target ? e.target.files[0] : e;
    // revoke previous preview if any
    if (previews.main) try { URL.revokeObjectURL(previews.main); } catch (e) {}
    const obj = f ? URL.createObjectURL(f) : null;
    setPreviews(prev => ({ ...prev, main: obj }));
    setFormData(prev => ({ ...prev, mainImageFile: f }));
    setMainDragging(false);
  };

  const handleMainDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setMainDragging(true);
  };

  const handleMainDragLeave = (e) => {
    e.preventDefault();
    setMainDragging(false);
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    setMainDragging(false);
    const f = Array.from(e.dataTransfer.files || []).find(ff => ff && ff.type && ff.type.startsWith('image/'));
    if (f) handleMainImageFile(f);
  };

  const handleRemoveMainImage = () => {
    // revoke preview URL if exists
    if (previews.main) {
      try { URL.revokeObjectURL(previews.main); } catch (e) {}
    }
    setPreviews(prev => ({ ...prev, main: null }));
    setFormData(prev => ({ ...prev, mainImageFile: null, mainImageUrl: '' }));
    setUploadProgress(prev => ({ ...prev, main: undefined }));
  };

  const handleAdditionalImageFile = (index, e) => {
    const f = e.target.files[0];
    const imgs = [...(formData.imageFiles || [])];
    imgs[index] = f;
    // manage previews array
    const imgPreviews = [...(previews.images || [])];
    if (imgPreviews[index]) {
      try { URL.revokeObjectURL(imgPreviews[index]); } catch (err) {}
    }
    imgPreviews[index] = f ? URL.createObjectURL(f) : null;
    setPreviews(prev => ({ ...prev, images: imgPreviews }));
    setFormData(prev => ({ ...prev, imageFiles: imgs }));
  };

  // Drag & drop handlers for additional images
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropImages = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f && f.type && f.type.startsWith('image/'));
    if (files.length === 0) return;
    const imgs = [...(formData.imageFiles || [])];
    const imgPreviews = [...(previews.images || [])];
    files.forEach(f => {
      imgs.push(f);
      imgPreviews.push(URL.createObjectURL(f));
    });
    setFormData(prev => ({ ...prev, imageFiles: imgs }));
    setPreviews(prev => ({ ...prev, images: imgPreviews }));
  };

  const addImageFileInput = () => {
    setFormData(prev => ({ ...prev, imageFiles: [...(prev.imageFiles || []), null] }));
    setPreviews(prev => ({ ...prev, images: [...(prev.images || []), null] }));
  };

  // Cleanup object URLs when modal closes or component unmounts
  useEffect(() => {
    if (!isOpen) {
      // revoke all previews
      if (previews.main) {
        try { URL.revokeObjectURL(previews.main); } catch (e) {}
      }
      (previews.images || []).forEach(p => { if (p) try { URL.revokeObjectURL(p); } catch (e) {} });
      setPreviews({ main: null, images: [] });
    }
    // also cleanup on unmount
    return () => {
      if (previews.main) {
        try { URL.revokeObjectURL(previews.main); } catch (e) {}
      }
      (previews.images || []).forEach(p => { if (p) try { URL.revokeObjectURL(p); } catch (e) {} });
    };
  }, [isOpen]);

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-xs text-gray-500">Ahora puedes subir una imagen en lugar de pegar una URL. Si quieres mantener la URL existente, déjala como está.</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
              <input
                ref={nameRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej: Zapatos deportivos Nike Air Max"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.brand ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej: Nike"
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Precio y costo (descuento en Opciones avanzadas) */}
            <div className={`grid grid-cols-1 ${advancedOpen ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base *</label>
                <input type="number" step="0.01" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${errors.basePrice ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo de compra (Bs.)</label>
                <input type="number" step="0.01" value={formData.purchaseCost} onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${errors.purchaseCost ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                {errors.purchaseCost && <p className="text-red-500 text-sm mt-1">{errors.purchaseCost}</p>}
              </div>

              {/* Descuento moved to advanced options */}
            </div>

            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => setAdvancedOpen(prev => !prev)} className="text-sm text-cyan-600">{advancedOpen ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}</button>
            </div>

            {advancedOpen && (
              <div className="mt-4 p-4 border rounded bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                    <input type="number" min="0" max="100" value={formData.descuento} onChange={(e) => setFormData({ ...formData, descuento: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                    {formData.descuento > 0 && formData.basePrice && (
                      <p className="text-green-600 text-sm mt-1">Precio con descuento: Bs. {(parseFloat(formData.basePrice) * (1 - parseFloat(formData.descuento) / 100)).toFixed(2)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto</label>
                    <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="nuevo">Nuevo</option>
                      <option value="medio uso">Medio Uso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por comas)</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="deportivo, cómodo, casual" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Disponible *</label>
                <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${errors.stock ? 'border-red-500' : 'border-gray-300'}`} placeholder="0" />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>

              <div className="flex items-center text-sm text-gray-500">Opciones avanzadas contienen Tipo y Estado.</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
              <div
                className={`w-full cursor-pointer rounded border p-4 flex items-center justify-center ${mainDragging ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 bg-white'}`}
                onClick={() => mainInputRef.current?.click()}
                onDragOver={handleMainDragOver}
                onDragLeave={handleMainDragLeave}
                onDrop={handleMainDrop}
              >
                <input ref={mainInputRef} type="file" accept="image/*" onChange={handleMainImageFile} className="hidden" />
                <div className="relative">
                  {previews.main ? (
                    <div className="w-40 h-40 rounded overflow-hidden shadow-sm">
                      <img src={previews.main} alt="preview-main" className="w-full h-full object-cover" />
                    </div>
                  ) : formData.mainImageUrl ? (
                    <div className="text-center text-xs text-gray-600">URL actual: <span className="text-cyan-600 break-words">{formData.mainImageUrl}</span></div>
                  ) : (
                    <div className="text-center text-sm text-gray-500">Arrastra una imagen aquí o haz click para seleccionar<br/><span className="text-xs text-gray-400">(PNG/JPG, máximo 5MB)</span></div>
                  )}

                  {(previews.main || formData.mainImageUrl) && (
                    <button type="button" onClick={handleRemoveMainImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">×</button>
                  )}
                </div>
              </div>
              {errors.mainImageFile && <p className="text-red-500 text-sm mt-1">{errors.mainImageFile}</p>}
              {/* Progress for main image */}
              {typeof uploadProgress.main === 'number' && (
                <div className="w-48 mt-2">
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div className="h-2 bg-cyan-600" style={{ width: `${uploadProgress.main}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{uploadProgress.main}%</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="Descripción detallada del producto..." />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* tags moved to advanced options */}
          </div>

          {/* Arrays: sizes, colors, images (URLs + file uploads) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tallas Disponibles</label>
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex mb-2">
                  <input type="text" value={size} onChange={(e) => handleArrayChange('sizes', index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg" placeholder="Ej: 42" />
                  {formData.sizes.length > 1 && <button type="button" onClick={() => removeArrayItem('sizes', index)} className="px-3 py-2 bg-red-500 text-white rounded-r-lg">×</button>}
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('sizes')} className="text-cyan-600 text-sm">+ Agregar talla</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colores Disponibles</label>
              {formData.colors.map((color, index) => (
                <div key={index} className="flex mb-2">
                  <input type="text" value={color} onChange={(e) => handleArrayChange('colors', index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg" placeholder="Ej: Negro" />
                  {formData.colors.length > 1 && <button type="button" onClick={() => removeArrayItem('colors', index)} className="px-3 py-2 bg-red-500 text-white rounded-r-lg">×</button>}
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('colors')} className="text-cyan-600 text-sm">+ Agregar color</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes Adicionales</label>

              {/* Mostrar miniaturas de las URLs existentes (editar) */}
              {formData.images && formData.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                      <img src={imgUrl} alt={`imagen-${idx}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeArrayItem('images', idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Subida de nuevas imágenes (PNG/JPG) - soporta drag & drop */}
              <div className={`mt-2 p-3 rounded border-2 border-dashed ${isDragging ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDropImages}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subir Imágenes Adicionales (PNG/JPG)</label>
                {(formData.imageFiles || []).map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleAdditionalImageFile(idx, e)} className="flex-1" />
                    {previews.images && previews.images[idx] && (
                      <div className="w-20 h-20 border rounded overflow-hidden">
                        <img src={previews.images[idx]} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Progress bar per file */}
                    {typeof uploadProgress[idx] === 'number' && (
                      <div className="w-32 ml-2">
                        <div className="h-2 bg-gray-200 rounded overflow-hidden">
                          <div className="h-2 bg-cyan-600" style={{ width: `${uploadProgress[idx]}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{uploadProgress[idx]}%</div>
                      </div>
                    )}
                    {formData.imageFiles.length > 1 && <button type="button" onClick={() => { 
                      const imgs = [...(formData.imageFiles || [])]; imgs.splice(idx, 1); setFormData(prev => ({ ...prev, imageFiles: imgs }));
                      // revoke preview URL if present
                      const imgPreviews = [...(previews.images || [])]; if (imgPreviews[idx]) { try { URL.revokeObjectURL(imgPreviews[idx]); } catch(e){} } imgPreviews.splice(idx,1); setPreviews(prev => ({ ...prev, images: imgPreviews }));
                    }} className="px-3 py-1 bg-red-500 text-white rounded">×</button>}
                  </div>
                ))}
                <div>
                  <button type="button" onClick={addImageFileInput} className="text-cyan-600 text-sm">+ Subir otra imagen</button>
                </div>
                {errors.imageFiles && <p className="text-red-500 text-sm mt-1">{errors.imageFiles}</p>}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg" disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan-600 text-white rounded-lg inline-flex items-center disabled:opacity-50">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />{product ? 'Actualizar' : 'Crear'} Producto
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