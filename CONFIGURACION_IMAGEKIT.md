# 🎯 Configuración de ImageKit para Comprobantes - Zapastroso

## 🚀 **Solución Implementada:**

Hemos cambiado de **Firebase Storage** a **ImageKit.io** para manejar la subida de comprobantes de pago. Esto resuelve completamente los problemas de CORS y configuración.

### ✅ **Ventajas de ImageKit:**
- 🆓 **Gratuito**: 20GB de almacenamiento
- ⚡ **CDN Global**: Carga ultra rápida
- 🔧 **Fácil configuración**: Solo 3 variables de entorno
- 🚫 **Sin CORS**: Funciona perfectamente desde localhost
- 📱 **API simple**: Subida directa desde el navegador

---

## 📋 **Paso a Paso - Configuración:**

### **Paso 1: Crear cuenta gratuita en ImageKit**

1. **Ve a:** https://imagekit.io/registration
2. **Completa el registro** con tu email
3. **Verifica tu email** y accede al dashboard

### **Paso 2: Obtener credenciales**

1. **En el dashboard**, ve a **"Developer Options"** → **"API Keys"**
2. **Copia las siguientes credenciales:**
   - `Public Key` (empieza con public_...)
   - `Private Key` (empieza con private_...)
   - `URL Endpoint` (https://ik.imagekit.io/tu_id_imagekit)

### **Paso 3: Configurar variables de entorno**

**Abre el archivo `.env`** y reemplaza estas líneas:

```env
# ImageKit Configuration (para comprobantes de pago)
VITE_IMAGEKIT_PUBLIC_KEY=public_tu_clave_publica_aqui
VITE_IMAGEKIT_PRIVATE_KEY=private_tu_clave_privada_aqui
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/tu_id_imagekit
```

**Ejemplo con credenciales reales:**
```env
VITE_IMAGEKIT_PUBLIC_KEY=public_W2zEV8UpTol+BUstVA+sPVP4jh4=
VITE_IMAGEKIT_PRIVATE_KEY=private_key_dsjhgfDSJHGF324jhds=
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/zapastroso123
```

### **Paso 4: Reiniciar el servidor**

```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npm run dev
```

---

## ✅ **Verificar que funciona:**

### **1. Ir al checkout**
```
http://localhost:5173/checkout
```

### **2. Buscar el uploader**
- ✅ Debe decir **"ImageKit"** en el encabezado (badge azul)
- ✅ NO debe aparecer mensaje de error amarillo
- ✅ El área de drag & drop debe estar habilitada

### **3. Probar subida**
- ✅ Arrastra una imagen PNG/JPG o PDF
- ✅ Debe subir sin errores CORS
- ✅ Debe mostrar confirmación verde
- ✅ El archivo debe aparecer en tu dashboard de ImageKit

---

## 🔧 **Funcionalidades Implementadas:**

### **Para Usuarios:**
- ✅ **Drag & Drop** funcional sin errores CORS
- ✅ **Validación automática** (PNG, JPG, PDF, máximo 5MB)
- ✅ **Vista previa** instantánea de imágenes
- ✅ **Organización automática** por usuario en `/comprobantes/{userId}/`
- ✅ **Tags automáticos** para identificar pedidos

### **Para Administradores:**
- ✅ **Badge verde** en pedidos con comprobantes
- ✅ **Visor integrado** con información del servicio
- ✅ **Vista previa** de imágenes
- ✅ **Descarga directa** y **abrir en nueva ventana**
- ✅ **Información detallada** (tamaño, fecha, tipo)

---

## 🔒 **Seguridad:**

### **Validaciones cliente:**
- ✅ **Tipos de archivo** permitidos
- ✅ **Tamaño máximo** 5MB
- ✅ **Nombres únicos** por pedido

### **Organización en ImageKit:**
```
/comprobantes/
  ├── user_123/
  │   ├── comprobante_order456_2025-10-30T15-30-00.jpg
  │   └── comprobante_order789_2025-10-30T16-45-30.pdf
  └── guest/
      └── comprobante_order321_2025-10-30T14-15-22.png
```

---

## 🎯 **Estados del Sistema:**

### **🟡 ImageKit NO configurado:**
- ❌ Mensaje amarillo con instrucciones
- ❌ Botón dice "ImageKit no configurado"
- ❌ Uploader deshabilitado
- ✅ Checkout sigue funcionando

### **🟢 ImageKit configurado:**
- ✅ Badge azul "ImageKit" visible
- ✅ Drag & drop completamente funcional
- ✅ Subida instantánea sin errores
- ✅ CDN global para carga rápida

---

## 🛠️ **Archivos Modificados:**

- ✅ `imagekitService.js` - Servicio principal de ImageKit
- ✅ `PaymentProofUploader.jsx` - Integra ImageKit
- ✅ `PaymentProofViewer.jsx` - Visor actualizado
- ✅ `Checkout.jsx` - Maneja datos de ImageKit
- ✅ `.env` - Variables de configuración
- ✅ Este archivo - Instrucciones completas

---

## 🚨 **Solución de Problemas:**

### **Error: "ImageKit no está configurado"**
- ✅ Verifica que las credenciales estén en `.env`
- ✅ Asegúrate de reiniciar el servidor
- ✅ Confirma que las claves no tengan espacios extras

### **Error: "401 Unauthorized"**
- ✅ Verifica que el Private Key sea correcto
- ✅ Confirma que el URL Endpoint sea el tuyo

### **Error: "File too large"**
- ✅ El archivo debe ser menor a 5MB
- ✅ Usa herramientas de compresión si es necesario

---

**🎉 Una vez configurado, ImageKit funcionará perfectamente sin problemas de CORS!**

**📞 Si tienes problemas, verifica que las credenciales sean exactamente como aparecen en tu dashboard de ImageKit.**