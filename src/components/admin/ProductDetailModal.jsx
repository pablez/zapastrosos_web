import { X, Package, Tag, Calendar, Eye, Star } from 'lucide-react';

const ProductDetailModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Eye className="w-6 h-6 mr-2 text-cyan-600" />
            Detalles del Producto
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda - Imagen principal */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.mainImageUrl || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2NjYyIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==';
                }}
              />
            </div>

            {/* Imágenes adicionales */}
            {product.images && product.images.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Imágenes Adicionales</h4>
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`${product.name} - imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Información del producto */}
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {product.brand}
                </span>
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {product.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Precio</h4>
              <div className="text-3xl font-bold text-cyan-600">
                ${product.basePrice?.toFixed(2) || 'N/A'}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'Sin descripción disponible'}
              </p>
            </div>

            {/* Tallas disponibles */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tallas Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colores disponibles */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Colores Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Etiquetas */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Información técnica */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Información Técnica</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID del Producto:</span>
                  <div className="font-mono text-gray-900">{product.id}</div>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <div className="font-medium text-gray-900 capitalize">{product.status}</div>
                </div>
                {product.createdAt && (
                  <div>
                    <span className="text-gray-600">Fecha de Creación:</span>
                    <div className="font-medium text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(product.createdAt.seconds * 1000).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                )}
                {product.updatedAt && (
                  <div>
                    <span className="text-gray-600">Última Actualización:</span>
                    <div className="font-medium text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(product.updatedAt.seconds * 1000).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas (opcional - para futuras implementaciones) */}
            <div className="bg-linear-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2 text-cyan-600" />
                Estadísticas del Producto
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-600">0</div>
                  <div className="text-xs text-gray-600">Ventas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-600">Vistas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-600">Stock</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                * Las estadísticas se implementarán en futuras versiones
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;