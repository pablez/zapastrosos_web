import { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [connected, setConnected] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus('Probando conexión a Firebase...');
    
    try {
      // Intentar una lectura sencilla para validar la conexión a Firestore
      try {
        await getDocs(collection(db, 'products'), { maxResults: 1 });
      } catch (err) {
        // algunas versiones no soportan maxResults en getDocs; intentar sin opciones
        await getDocs(collection(db, 'products'));
      }
      const isConnected = true;
      if (isConnected) {
        setStatus('✅ Conexión exitosa a Firebase!');
        setConnected(true);
      } else {
        setStatus('❌ Error conectando a Firebase');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Nota: la carga automática de datos de prueba fue removida del UI por seguridad.
  // Si necesitas poblar datos de prueba, usa scripts separados o contacta al mantenedor.

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            🔧 Configuración Firebase - Zapastroso
          </h1>
          
          <div className="space-y-6">
            {/* Test Connection */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">1. Probar Conexión</h2>
              <p className="text-gray-600 mb-4">
                Verifica que Firebase esté configurado correctamente
              </p>
              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition duration-300"
              >
                {loading ? 'Probando...' : 'Probar Conexión Firebase'}
              </button>
            </div>

            {/* Initialize Data - removed */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">2. Cargar Datos de Prueba</h2>
              <p className="text-gray-600 mb-4">
                La carga automática de datos de prueba fue removida del UI. Si necesitas poblar
                datos, usa scripts separados en `src/tools/` o carga manualmente desde la
                consola de Firebase.
              </p>
            </div>

            {/* Status */}
            {status && (
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Estado:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {status}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="border rounded-lg p-6 bg-blue-50">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">📋 Instrucciones:</h3>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>1. <strong>Probar Conexión</strong>: Verifica que Firebase funcione</li>
                <li>2. <strong>Cargar Datos</strong>: (El instalador automático fue removido) usa scripts o la consola de Firebase</li>
                <li>3. <strong>Ir a la tienda</strong>: Ve a la página principal para ver los productos</li>
                <li>4. <strong>Probar admin</strong>: Usa el login con credenciales de Firebase Auth</li>
              </ol>
            </div>

            {/* Navigation */}
            <div className="flex justify-center space-x-4 pt-6">
              <a
                href="/"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
              >
                🏠 Ir a la Tienda
              </a>
              <a
                href="/login"
                className="bg-linear-to-r from-cyan-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-teal-700 transition duration-300"
              >
                🔐 Panel Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;