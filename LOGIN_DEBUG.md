# 🔧 Guía para Solucionar Problemas de Redirección

## ✅ **Cambios Realizados:**

### 1. **AuthContext Corregido:**
- ✅ Cambiado de buscar en `administradores` a `users`
- ✅ Verificación correcta del campo `role: 'admin'`

### 2. **Login Mejorado:**
- ✅ Verificación de permisos admin antes de redirigir
- ✅ Auto-logout si el usuario no es admin
- ✅ Mensajes de error específicos
- ✅ Redirección programática con `navigate()`

## 🧪 **Pasos para Probar:**

### 1. **Crear Usuario Admin:**
```bash
# Ve a:
http://localhost:5173/admin-setup

# Usa estas credenciales de prueba:
Email: admin@zapastroso.com
Nombre: Admin
Apellido: Zapastroso
Contraseña: admin123
Código Secreto: ZAPASTROSO_ADMIN_2025
```

### 2. **Probar Login:**
```bash
# Ve a:
http://localhost:5173/login

# Usa las mismas credenciales:
Email: admin@zapastroso.com
Contraseña: admin123
```

### 3. **Verificar Redirección:**
- ✅ Debe redirigir automáticamente a `/admin`
- ✅ Si no es admin, debe mostrar error y cerrar sesión
- ✅ Si ya está logueado, debe ir directo a admin

## 🔍 **Debug en Caso de Problemas:**

### **Verificar en DevTools (F12):**

1. **Console Tab:**
```javascript
// Verificar usuario actual
firebase.auth().currentUser

// Verificar datos en Firestore
// (después de login exitoso)
```

2. **Network Tab:**
- Verificar que no hay errores 404 o 500
- Verificar que las llamadas a Firebase funcionan

3. **Application Tab → Local Storage:**
- Verificar que hay datos de Firebase Auth

### **Posibles Problemas y Soluciones:**

#### **❌ No redirige después del login:**
```javascript
// Verificar que el usuario tiene role: 'admin' en Firestore
// Ir a Firebase Console → Firestore → users → [uid]
// Debe tener: { role: 'admin', ... }
```

#### **❌ Error "Not found":**
```javascript
// Verificar que las rutas están bien definidas en App.jsx
// Rutas actuales:
// /admin-setup → AdminSetup
// /login → Login  
// /admin → AdminPanel (protegida)
```

#### **❌ Error de permisos:**
```javascript
// Verificar las reglas de Firestore
// Deben permitir lectura de users/{uid} para el propio usuario
```

## 🛠️ **Comandos de Verificación:**

```bash
# 1. Verificar que el servidor esté corriendo
npm run dev

# 2. Verificar reglas de Firestore
npx firebase firestore:rules

# 3. Re-deploy reglas si es necesario
npx firebase deploy --only firestore:rules
```

## 📱 **URLs de Prueba:**

```bash
# Página principal
http://localhost:5173/

# Crear admin (solo primera vez)
http://localhost:5173/admin-setup

# Login de admin
http://localhost:5173/login

# Panel de admin (después de login)
http://localhost:5173/admin

# Test de Firebase
http://localhost:5173/firebase-test
```

## 🚨 **Si Nada Funciona:**

1. **Borrar caché del navegador** (Ctrl+Shift+R)
2. **Verificar consola de Firebase** para errores
3. **Revisar que el proyecto Firebase está activo**
4. **Verificar conexión a internet**

---

**💡 Tip:** Si sigues teniendo problemas, usa las DevTools para ver exactamente qué está fallando en la consola del navegador.