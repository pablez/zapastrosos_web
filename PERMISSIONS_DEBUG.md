# 🔧 Solución de Error de Permisos

## ❌ **Error Encontrado:**
```
Missing or insufficient permissions
```

## 🔍 **DIAGNÓSTICO Y SOLUCIONES:**

### 📋 **1. Verificar Estado del Usuario:**

#### **Ir a:** `http://localhost:5173/firebase-test` (o usa la consola de Firebase)
En esta página encontrarás herramientas para probar la conexión a Firebase y ver mensajes de estado; para verificar permisos, consulta directamente la colección `users` en la consola de Firebase.
- ✅ Si estás autenticado
- ✅ Tu email y UID
- ✅ Si tu documento existe en Firestore
- ✅ Si tienes role: 'admin'

### 🛠️ **2. Soluciones por Problema:**

#### **Problema A: Usuario no es admin**
```javascript
// Si en el debug ves: "role": "user" o role undefined
```

**Solución:**
1. Ve a [Firebase Console - Firestore](https://console.firebase.google.com/project/zapastrosos-web/firestore)
2. Busca la colección `users`
3. Encuentra tu documento (tu UID)
4. Edita el campo `role` y cámbialo a `"admin"`

#### **Problema B: Documento de usuario no existe**
```javascript
// Si en el debug ves: "userDocExists": false
```

**Solución:**
1. Vuelve a crear el usuario admin en: `http://localhost:5173/admin-setup`
2. O crea manualmente el documento en Firestore:
   ```json
   {
     "email": "tu-email@ejemplo.com",
     "role": "admin",
     "firstName": "Tu Nombre",
     "lastName": "Tu Apellido",
     "createdAt": "fecha actual",
     "isActive": true
   }
   ```

#### **Problema C: No estás autenticado**
```javascript
// Si en el debug ves: "isAuthenticated": false
```

**Solución:**
1. Ve a: `http://localhost:5173/login`
2. Inicia sesión con tus credenciales de admin
3. Si no tienes credenciales, crea un admin nuevo

### 🔄 **3. Proceso de Verificación Completo:**

#### **Paso 1: Verificar Autenticación**
```bash
# Ve a login
http://localhost:5173/login

# Inicia sesión con tu email y contraseña de admin
```

#### **Paso 2: Verificar Documento en Firestore**
```bash
# Ve a Firebase Console
https://console.firebase.google.com/project/zapastrosos-web/firestore

# Navega a: users > [tu-uid]
# Verifica que existe y tiene: role: "admin"
```

#### **Paso 3: Verificar Permisos**
```bash
# Verifica permisos desde la consola de Firebase o usando `/firebase-test`
```

#### **Paso 4: Población de Datos (opcional)**
La UI para inicializar datos fue removida. Si necesitas poblar datos para pruebas y ya verificaste permisos:

- Ejecuta un script de inicialización (puedo generarlo para ti).
- O inserta documentos manualmente desde la consola de Firebase.

Evita cambiar reglas de seguridad de forma permanente — solo úsalas temporalmente para debugging si es estrictamente necesario.

### 🚨 **4. Soluciones de Emergencia:**

#### **Opción A: Recrear Usuario Admin**
```bash
1. Ve a: http://localhost:5173/admin-setup
2. Código: ZAPASTROSO_ADMIN_2025
3. Usa un email diferente si es necesario
4. Prueba de nuevo
```

#### **Opción B: Modificar Reglas Temporalmente**
**Solo para testing - NO para producción:**

1. Ve a Firebase Console → Firestore → Rules
2. Cambia temporalmente:
```javascript
// TEMPORAL - Solo para debug
match /{document=**} {
  allow read, write: if request.auth != null;
}
```
3. Haz deploy: `npx firebase deploy --only firestore:rules`
4. Prueba la inicialización
5. **IMPORTANTE:** Vuelve a las reglas seguras después

### 📞 **5. Información de Debug:**

#### **Datos que necesitas verificar:**
- ✅ **Email:** Tu email de admin registrado
- ✅ **UID:** Tu identificador único de Firebase
- ✅ **Role:** Debe ser exactamente "admin"
- ✅ **Document:** Debe existir en users/{uid}

#### **Comandos útiles:**
```bash
# Ver logs en consola del navegador
F12 → Console

# Re-deploy reglas
npx firebase deploy --only firestore:rules

# Verificar conexión
http://localhost:5173/firebase-test
```

---

**🎯 La causa más común es que el usuario no tiene `role: "admin"` en su documento de Firestore.**

**📝 Usa el debug de permisos para ver exactamente cuál es el problema.**