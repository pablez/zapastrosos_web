import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Shield, 
  Mail, 
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: {
      manageProducts: true,
      manageOrders: true,
      manageUsers: false,
      viewAnalytics: true
    }
  });

  // Confirm modal state for destructive actions
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  // Contextual menu state for cards/table
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefsRef = useRef({});

  // Modal open state for animation (controls slide-up)
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar usuarios administradores
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const admins = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'admin');
      
      setUsers(admins);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar los usuarios administradores'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Close contextual menu on outside click / Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openMenuId) return;
      const menuEl = menuRefsRef.current[`menu-${openMenuId}`];
      const btnEl = menuRefsRef.current[openMenuId];
      if (menuEl && !menuEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenuId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permission = name.split('.')[1];
      setNewUserForm(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: checked
        }
      }));
    } else {
      setNewUserForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validaciones
      if (!newUserForm.email || !newUserForm.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (newUserForm.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUserForm.email, 
        newUserForm.password
      );

      const userId = userCredential.user.uid;

      // Crear documento en Firestore
      await setDoc(doc(db, 'users', userId), {
        firstName: newUserForm.firstName,
        lastName: newUserForm.lastName,
        email: newUserForm.email,
        role: 'admin',
        permissions: newUserForm.permissions,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        isActive: true
      });

      setMessage({
        type: 'success',
        text: 'Administrador creado exitosamente'
      });

      // Limpiar formulario
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: {
          manageProducts: true,
          manageOrders: true,
          manageUsers: false,
          viewAnalytics: true
        }
      });

      setShowCreateForm(false);
      loadUsers();

    } catch (error) {
      console.error('Error al crear administrador:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al crear el administrador'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (userId === currentUser.uid) {
      setMessage({
        type: 'error',
        text: 'No puedes eliminar tu propia cuenta'
      });
      return;
    }
    // Abrir modal de confirmación en vez de window.confirm
    setConfirmState({
      open: true,
      title: 'Eliminar administrador',
      message: '¿Estás seguro de que quieres eliminar este administrador?',
      onConfirm: async () => {
        setConfirmState(s => ({ ...s, open: false }));
        try {
          await deleteDoc(doc(db, 'users', userId));
          setMessage({ type: 'success', text: 'Administrador eliminado exitosamente' });
          loadUsers();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          setMessage({ type: 'error', text: 'Error al eliminar el administrador' });
        }
      }
    });
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        permissions,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      });

      setMessage({
        type: 'success',
        text: 'Permisos actualizados exitosamente'
      });

      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      setMessage({
        type: 'error',
        text: 'Error al actualizar los permisos'
      });
    }
  };

  // Open editing modal with animation
  useEffect(() => {
    if (editingUser) {
      // slight delay to allow modal to mount then animate
      requestAnimationFrame(() => setModalOpen(true));
    } else {
      setModalOpen(false);
    }
  }, [editingUser]);

  const permissionLabels = {
    manageProducts: 'Gestionar Productos',
    manageOrders: 'Gestionar Pedidos', 
    manageUsers: 'Gestionar Usuarios',
    viewAnalytics: 'Ver Analíticas'
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Administradores</h1>
            <p className="text-gray-600">Administra los usuarios con acceso al panel</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="hidden md:inline-flex bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Nuevo Admin
        </button>
      </div>
      {/* Confirm modal */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(s => ({ ...s, open: false }))}
      />

      {/* Floating Action Button (mobile) - centrado abajo, con soporte safe-area */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed z-70 md:hidden left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 1.25rem) + 0.5rem)' }}
        aria-label="Nuevo administrador"
        title="Nuevo administrador"
      >
        <UserPlus className="w-7 h-7" />
      </button>

      {/* Mensaje de estado */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Crear Nuevo Administrador</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={createAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newUserForm.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={newUserForm.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={newUserForm.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={newUserForm.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Permisos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Shield className="w-4 h-4 inline mr-1" />
                Permisos
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`permissions.${key}`}
                      checked={newUserForm.permissions[key]}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Creando...' : 'Crear Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Administradores Registrados</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Mobile: tarjetas por usuario */}
            <div className="md:hidden space-y-3 p-2">
              {users.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay administradores</h3>
                  <p className="text-gray-500">Crea uno nuevo usando el botón "Nuevo Admin"</p>
                </div>
              ) : (
                users.map(adminUser => (
                  <article key={adminUser.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{adminUser.firstName} {adminUser.lastName}</div>
                            <div className="text-xs text-gray-500">{adminUser.email}</div>
                          </div>
                          <div className="shrink-0 ml-2 text-sm">
                            {adminUser.id === currentUser.uid && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tu cuenta</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {adminUser.permissions && Object.entries(adminUser.permissions)
                            .filter(([_, enabled]) => enabled)
                            .map(([permission]) => (
                              <span key={permission} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{permissionLabels[permission]}</span>
                            ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-500">Creado: {adminUser.createdAt?.toDate?.()?.toLocaleDateString() || 'No disponible'}</div>
                      </div>

                      <div className="shrink-0 ml-2 relative">
                          <button
                            ref={el => { menuRefsRef.current[adminUser.id] = el; }}
                            aria-haspopup="true"
                            aria-expanded={openMenuId === adminUser.id}
                            onClick={() => setOpenMenuId(openMenuId === adminUser.id ? null : adminUser.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                            aria-label="Abrir acciones"
                          >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>

                        {openMenuId === adminUser.id && (
                          <div
                            role="menu"
                            aria-label="Acciones del administrador"
                            className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                            ref={el => { if (el) menuRefsRef.current[`menu-${adminUser.id}`] = el; }}
                          >
                            <div className="py-1">
                              <button role="menuitem" onClick={() => { setOpenMenuId(null); setEditingUser(adminUser); }} className="w-full text-left px-3 py-2 text-sm text-cyan-600 hover:bg-gray-50">Editar</button>
                              <div className="border-t" />
                              <button role="menuitem" onClick={() => { setOpenMenuId(null); deleteUser(adminUser.id); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50">Eliminar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Desktop / tablet: tabla md+ */}
            <div className="hidden md:block bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((adminUser) => (
                      <tr key={adminUser.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-full"><User className="w-5 h-5 text-gray-600" /></div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{adminUser.firstName} {adminUser.lastName}</div>
                              <div className="text-sm text-gray-500">{adminUser.email}</div>
                              {adminUser.id === currentUser.uid && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tu cuenta</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {adminUser.permissions && Object.entries(adminUser.permissions).filter(([_, enabled]) => enabled).map(([permission]) => (
                              <span key={permission} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{permissionLabels[permission]}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adminUser.createdAt?.toDate?.()?.toLocaleDateString() || 'No disponible'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <div className="relative inline-block">
                              <button
                                ref={el => { menuRefsRef.current[adminUser.id] = el; }}
                                aria-haspopup="true"
                                aria-expanded={openMenuId === adminUser.id}
                                onClick={() => setOpenMenuId(openMenuId === adminUser.id ? null : adminUser.id)}
                                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                                aria-label="Abrir acciones"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                              </button>

                              {openMenuId === adminUser.id && (
                                <div
                                  role="menu"
                                  aria-label="Acciones del administrador"
                                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                                  ref={el => { if (el) menuRefsRef.current[`menu-${adminUser.id}`] = el; }}
                                >
                                  <div className="py-1">
                                    <button role="menuitem" onClick={() => { setOpenMenuId(null); setEditingUser(adminUser); }} className="w-full text-left px-3 py-2 text-sm text-cyan-600 hover:bg-gray-50">Editar</button>
                                    <div className="border-t" />
                                    <button role="menuitem" onClick={() => { setOpenMenuId(null); deleteUser(adminUser.id); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50">Eliminar</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de edición de permisos */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-t-lg sm:rounded-lg p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${modalOpen ? 'translate-y-0 opacity-100 sm:scale-100 sm:opacity-100' : 'translate-y-full opacity-0 sm:scale-95 sm:opacity-0'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Editar Permisos - {editingUser.firstName} {editingUser.lastName}
              </h3>
              <button
                onClick={() => {
                  // animate close then clear editingUser
                  setModalOpen(false);
                  setTimeout(() => setEditingUser(null), 300);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={editingUser.permissions?.[key] || false}
                    onChange={(e) => {
                      setEditingUser(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [key]: e.target.checked
                        }
                      }));
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateUserPermissions(editingUser.id, editingUser.permissions)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;