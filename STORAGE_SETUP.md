# 🔧 Configuración de Firebase Storage

## ⚠️ **Firebase Storage No Configurado**

Para completar la configuración de tu proyecto, necesitas activar Firebase Storage.

### 📋 **Pasos para Activar Storage:**

#### **1. Ve a la Consola de Firebase:**
```
https://console.firebase.google.com/project/zapastrosos-web/storage
```

#### **2. Haz clic en "Get Started" o "Comenzar"**

#### **3. Acepta las reglas de seguridad por defecto** (las cambiaremos después)

#### **4. Selecciona una ubicación para Storage:**
- Recomendado: **us-central1** (misma región que Firestore)

#### **5. Después de activar, ejecuta:**
```bash
npx firebase deploy --only storage:rules
```

### 🎯 **Reglas de Seguridad Configuradas:**

Las reglas que ya están en `storage.rules` incluyen:

#### **🖼️ Imágenes de Productos:**
- ✅ **Lectura:** Pública (todos pueden ver)
- ✅ **Escritura:** Solo administradores

#### **👤 Avatares de Usuarios:**
- ✅ **Lectura:** Pública
- ✅ **Escritura:** Solo el propio usuario + admins

#### **🏢 Assets de la Tienda:**
- ✅ **Lectura:** Pública (logos, banners)
- ✅ **Escritura:** Solo administradores

#### **⏱️ Archivos Temporales:**
- ✅ **Lectura/Escritura:** Solo el usuario propietario
- ✅ **Auto-delete:** Después de 24 horas

### 🔒 **Validaciones de Seguridad:**

#### **📏 Tamaño de Archivo:**
- Máximo: **5MB** por imagen

#### **📁 Tipos de Archivo:**
- Solo: **Imágenes** (jpg, png, gif, webp, etc.)

#### **👥 Autenticación:**
- Usuarios deben estar **logueados** para subir archivos
- Verificación de **permisos de admin** para contenido de la tienda

### 🚀 **Después de Activar Storage:**

1. **Deploy de reglas:**
```bash
npx firebase deploy --only storage:rules
```

2. **Probar subida de imágenes** en el panel de admin

3. **Verificar que las reglas funcionan** correctamente

### 📞 **Si Tienes Problemas:**

#### **Error de permisos:**
- Verifica que estás logueado: `firebase login`
- Confirma que tienes permisos en el proyecto

#### **Error de región:**
- Usa la misma región que Firestore
- Típicamente: `us-central1`

#### **Error de reglas:**
- Las reglas se aplicarán automáticamente
- Puedes verificarlas en Firebase Console → Storage → Rules

---

**🔗 Link Directo:** [Activar Firebase Storage](https://console.firebase.google.com/project/zapastrosos-web/storage)

**⏭️ Próximo paso:** Una vez activado Storage, podrás subir imágenes reales para tus productos.