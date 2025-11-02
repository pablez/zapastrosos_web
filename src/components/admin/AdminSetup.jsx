import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    secretCode: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Código secreto para crear admin (en producción, esto debería estar en variables de entorno)
  const ADMIN_SECRET_CODE = 'ZAPASTROSO_ADMIN_2025';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }

    if (formData.secretCode !== ADMIN_SECRET_CODE) {
      setMessage({ type: 'error', text: 'Código secreto incorrecto' });
      return false;
    }

    return true;
  };

  const checkIfAdminExists = async () => {
    try {
      const adminQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      const adminSnapshot = await getDocs(adminQuery);
      return !adminSnapshot.empty;
    } catch (error) {
      console.error('Error checking for existing admin:', error);
      return false;
    }
  };

  const createAdminUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Verificar si ya existe un admin
      const adminExists = await checkIfAdminExists();
      if (adminExists) {
        setMessage({ type: 'error', text: 'Ya existe un usuario administrador en el sistema' });
        setLoading(false);
        return;
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Crear documento de usuario en Firestore con role admin
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        permissions: [
          'manage_products',
          'manage_orders',
          'manage_users',
          'view_analytics',
          'manage_categories'
        ]
      });

      setMessage({ 
        type: 'success', 
        text: `¡Usuario administrador creado exitosamente! Bienvenido ${formData.firstName}` 
      });

      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        secretCode: '',
        firstName: '',
        lastName: ''
      });

      // Redirigir al panel de admin después de 2 segundos
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);

    } catch (error) {
      console.error('Error creating admin user:', error);
      let errorMessage = 'Error al crear usuario administrador';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-cyan-500 to-teal-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Configuración Inicial
            </h1>
            <p className="text-gray-600">
              Crear el primer usuario administrador
            </p>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">¡Importante!</p>
                <p className="text-amber-700">
                  Esta página solo debe ser usada para crear el primer administrador. 
                  Después de esto, los nuevos admins se crean desde el panel de administración.
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={createAdminUser} className="space-y-6">
            {/* Nombre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Administrador
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="admin@zapastroso.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Repite la contraseña"
                required
              />
            </div>

            {/* Secret Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Secreto
              </label>
              <input
                type="password"
                name="secretCode"
                value={formData.secretCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Código secreto de administrador"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Contacta al desarrollador para obtener el código
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-cyan-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Creando Administrador...' : 'Crear Administrador'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes una cuenta? {' '}
              <a href="/login" className="text-cyan-600 hover:text-cyan-500 font-medium">
                Iniciar Sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;