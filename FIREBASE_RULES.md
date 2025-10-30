# 🔥 Reglas de Seguridad de Firestore para Zapastroso

## 📋 Configuración Requerida en Firebase Console

### 1. Ve a Firebase Console → Firestore Database → Rules

### 2. Reemplaza las reglas por defecto con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para productos tenis (lectura pública, escritura solo admins)
    match /tenis/{document} {
      allow read: if true; // Cualquiera puede leer productos
      allow write: if isAdmin(); // Solo admins pueden escribir
    }
    
    // Reglas para variantes de productos
    match /variantes/{document} {
      allow read: if true; // Cualquiera puede leer variantes
      allow write: if isAdmin(); // Solo admins pueden escribir
    }
    
    // Reglas para marcas
    match /marcas/{document} {
      allow read: if true; // Cualquiera puede leer marcas
      allow write: if isAdmin(); // Solo admins pueden escribir
    }
    
    // Reglas para categorías
    match /categorias/{document} {
      allow read: if true; // Cualquiera puede leer categorías
      allow write: if isAdmin(); // Solo admins pueden escribir
    }
    
    // Reglas para pedidos
    match /pedidos/{document} {
      allow read: if isAdmin() || isOwner(resource.data.userID);
      allow create: if request.auth != null; // Usuarios autenticados pueden crear pedidos
      allow update, delete: if isAdmin(); // Solo admins pueden modificar/eliminar
    }
    
    // Reglas para reservas
    match /reservas/{document} {
      allow read: if isAdmin() || isOwner(resource.data.userID);
      allow create: if request.auth != null; // Usuarios autenticados pueden crear reservas
      allow update, delete: if isAdmin() || isOwner(resource.data.userID);
    }
    
    // Reglas para administradores (solo lectura, escritura desde consola)
    match /administradores/{document} {
      allow read: if isAdmin(); // Solo admins pueden leer la lista
      allow write: if false; // Solo desde la consola de Firebase
    }
    
    // Reglas para usuarios
    match /usuarios/{document} {
      allow read, write: if isAdmin() || isOwner(document);
    }
    
    // Reglas para documentos de test (solo durante desarrollo)
    match /test/{document} {
      allow read, write: if true; // Permitir para testing
    }
    
    // Funciones auxiliares
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/administradores/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Configuración de Storage Rules

Ve a Firebase Console → Storage → Rules y usa estas reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Imágenes de productos (lectura pública, escritura solo admins)
    match /productos/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Comprobantes de pago (lectura y escritura para usuarios autenticados)
    match /comprobantes/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == userId || isAdmin());
    }
    
    // Logos y assets de la tienda (lectura pública, escritura solo admins)
    match /assets/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Función para verificar si es admin
    function isAdmin() {
      return request.auth != null && 
             firestore.get(/databases/(default)/documents/administradores/$(request.auth.uid)).data != null;
    }
  }
}
```

## 🔧 Configuración Adicional en Firebase Console

### 1. Authentication
- Ve a Authentication → Sign-in method
- Habilita "Email/password"
- Opcional: Habilita Google si quieres login con Google

### 2. Firestore Database
- Debe estar en modo "production" con las reglas de arriba
- Crear índices si es necesario (Firebase te dirá cuáles)

### 3. Storage
- Configurar con las reglas de Storage de arriba
- Crear carpetas: `productos/`, `comprobantes/`, `assets/`

## 👤 Crear Usuario Administrador

### Opción 1: Desde Authentication Console
1. Ve a Authentication → Users
2. Clic en "Add user"
3. Email: `admin@zapastroso.com`
4. Password: `tu_password_seguro`
5. Copia el UID generado

### Opción 2: Desde Firestore Console
1. Ve a Firestore Database
2. Crear colección `administradores`
3. Crear documento con el UID del usuario
4. Campos:
   ```json
   {
     "uid": "el_uid_del_usuario",
     "nombre": "Admin Zapastroso",
     "email": "admin@zapastroso.com",
     "rol": "super_admin",
     "permisos": ["read", "write", "delete", "manage_users"]
   }
   ```

## ✅ Checklist de Configuración

- [ ] Reglas de Firestore configuradas
- [ ] Reglas de Storage configuradas  
- [ ] Authentication habilitado (Email/password)
- [ ] Usuario administrador creado
- [ ] UID del admin agregado a colección `administradores`
- [ ] Probar conexión desde la app
- [ ] Cargar datos de prueba

## 🚨 Importante

- **Nunca** pongas las reglas en modo test en producción
- Las reglas actuales permiten lectura pública de productos (normal para e-commerce)
- Solo usuarios autenticados pueden hacer pedidos
- Solo admins pueden gestionar productos e inventario
- Los comprobantes de pago son privados por usuario

---

¡Una vez configurado todo esto, tu tienda Zapastroso estará completamente funcional y segura! 🔐👟