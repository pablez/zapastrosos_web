import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { initializeTestData } from '../../services/initializeData';
import { Database, Play, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import PermissionsDebug from './PermissionsDebug';

const DataInitializer = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleInitializeData = async () => {
    // Verificar autenticación y permisos
    if (!user) {
      setError('Usuario no autenticado. Por favor inicia sesión.');
      return;
    }

    if (!isAdmin) {
      setError('No tienes permisos de administrador para ejecutar esta acción.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Verificando permisos de administrador...');
    setResults(null);

    try {
      console.log('🔐 Usuario autenticado:', user.email);
      console.log('👑 Es admin:', isAdmin);
      console.log('🆔 UID:', user.uid);

      setStatus('Iniciando proceso de inicialización...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular proceso

      setStatus('Creando categorías...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('Agregando productos...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('Configurando inventario...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await initializeTestData();
      
      setResults(result);
      setStatus('¡Inicialización completada exitosamente!');
      
    } catch (error) {
      console.error('Error durante la inicialización:', error);
      
      let errorMessage = `Error: ${error.message}`;
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permisos insuficientes. Verifica que tu usuario tenga role: "admin" en Firestore.';
      } else if (error.message.includes('Missing or insufficient permissions')) {
        errorMessage = 'Error de permisos de Firestore. Verifica las reglas de seguridad y que tu usuario sea admin.';
      }
      
      setError(errorMessage);
      setStatus('Error durante la inicialización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inicialización de Datos
          </h1>
          <p className="text-gray-600">
            Poblar la base de datos con productos y categorías iniciales
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                ¿Qué hace esta inicialización?
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• <strong>Categorías:</strong> Basketball, Running, Casual, Formal, Deportivo</li>
                <li>• <strong>Marcas:</strong> Nike, Adidas, Puma, Vans, Converse</li>
                <li>• <strong>Productos:</strong> 8+ zapatos de muestra con variantes</li>
                <li>• <strong>Variantes:</strong> Diferentes colores y tallas por producto</li>
                <li>• <strong>Inventario:</strong> Stock inicial para cada talla</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {status && (
          <div className={`p-4 rounded-lg mb-6 ${
            error 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : loading
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <div className="flex items-center">
              {loading && <Loader className="w-5 h-5 mr-3 animate-spin" />}
              {error && <AlertTriangle className="w-5 h-5 mr-3" />}
              {!loading && !error && <CheckCircle className="w-5 h-5 mr-3" />}
              <span className="font-medium">{status}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Error durante la inicialización</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              ✅ Inicialización Completada
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {results.categoriesCreated || 0}
                </div>
                <div className="text-green-600">Categorías</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {results.productsCreated || 0}
                </div>
                <div className="text-green-600">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {results.variantsCreated || 0}
                </div>
                <div className="text-green-600">Variantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {results.brandsCreated || 0}
                </div>
                <div className="text-green-600">Marcas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {results.inventoryCreated || 0}
                </div>
                <div className="text-green-600">Stock Items</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleInitializeData}
            disabled={loading}
            className={`inline-flex items-center px-8 py-4 rounded-lg font-medium text-white transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                Inicializando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-3" />
                Inicializar Base de Datos
              </>
            )}
          </button>
        </div>

        {/* Warning */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">⚠️ Importante:</p>
              <p>Esta acción agregará datos de muestra a tu base de datos. Si ya tienes productos, considera hacer backup antes de continuar.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {results && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Siguientes Pasos
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Ve al <strong>Panel de Productos</strong> para ver los productos creados</p>
              <p>• Visita la <strong>Tienda</strong> para ver cómo se ven para los clientes</p>
              <p>• Configura <strong>Firebase Storage</strong> para subir imágenes reales</p>
              <p>• Personaliza los productos con tus propios datos</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Debug Component */}
      <PermissionsDebug />
    </div>
  );
};

export default DataInitializer;