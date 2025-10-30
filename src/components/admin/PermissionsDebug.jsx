import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useState } from 'react';

const PermissionsDebug = () => {
  const { user, isAdmin } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      if (!user) {
        setDebugInfo({ error: 'Usuario no autenticado' });
        return;
      }

      // Verificar documento del usuario en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      const info = {
        auth: {
          isAuthenticated: !!user,
          email: user?.email,
          uid: user?.uid,
          emailVerified: user?.emailVerified
        },
        firestore: {
          userDocExists: userDoc.exists(),
          userData: userDoc.exists() ? userDoc.data() : null
        },
        context: {
          isAdmin: isAdmin
        }
      };

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 Debug de Permisos</h3>
      
      <button
        onClick={checkPermissions}
        disabled={loading}
        className="bg-gray-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Verificando...' : 'Verificar Permisos'}
      </button>

      {debugInfo && (
        <div className="bg-white p-4 rounded border">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PermissionsDebug;