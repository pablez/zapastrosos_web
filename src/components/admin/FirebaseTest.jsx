import { useState } from 'react';
import { testFirebaseConnection, initializeTestData } from '../../services/initializeData';

const FirebaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [connected, setConnected] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus('Probando conexión a Firebase...');
    
    try {
      const isConnected = await testFirebaseConnection();
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

  const handleInitializeData = async () => {
    if (!connected) {
      setStatus('❌ Primero debes probar la conexión a Firebase');
      return;
    }

    setLoading(true);
    setStatus('Cargando datos de prueba...');
    
    try {
      await initializeTestData();
      setStatus('✅ ¡Datos de prueba cargados exitosamente!\n\n📊 Se crearon:\n• 3 productos tenis\n• 14 variantes\n• 5 marcas\n• 5 categorías\n• 1 usuario admin');
    } catch (error) {
      setStatus(`❌ Error cargando datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

            {/* Initialize Data */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">2. Cargar Datos de Prueba</h2>
              <p className="text-gray-600 mb-4">
                Carga productos, marcas y categorías de ejemplo para probar la tienda
              </p>
              <button
                onClick={handleInitializeData}
                disabled={loading || !connected}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition duration-300"
              >
                {loading ? 'Cargando...' : 'Cargar Datos de Prueba'}
              </button>
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
                <li>2. <strong>Cargar Datos</strong>: Crea productos y categorías de ejemplo</li>
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
                className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-teal-700 transition duration-300"
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