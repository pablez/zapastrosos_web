# 📸 INSTRUCCIONES PARA AGREGAR LA IMAGEN QR

## 🎯 Pasos para reemplazar la imagen:

1. **Guarda la imagen QR** que me enviaste como `qr-pago.png`

2. **Colócala exactamente en esta ruta**:
   ```
   public/images/qr-pago.png
   ```

3. **Verifica la estructura**:
   ```
   zapastrosos-web/
   ├── public/
   │   └── images/
   │       └── qr-pago.png  ← Aquí debe estar tu imagen
   ├── src/
   └── ...
   ```

4. **Reemplaza** el archivo placeholder que creé con tu imagen real

## ✅ Características del componente:

- ✅ **Tamaño optimizado**: 192x192px (ajustable con CSS)
- ✅ **Responsive**: Se adapta a diferentes pantallas
- ✅ **Fallback**: Si la imagen no carga, muestra un ícono QR
- ✅ **Accesibilidad**: Alt text descriptivo
- ✅ **Profesional**: Bordes y sombras como el diseño original

## 🔄 Recarga automática:

Una vez que coloques la imagen en la ruta correcta, Vite detectará el cambio automáticamente y el QR real aparecerá en el checkout.

## 📱 Resultado esperado:

El checkout mostrará tu QR real de Yape con:
- Logo de Yape en la parte superior
- Tu QR code real y funcional
- Información "Gerardo Pablo Moya Grageda"
- Vencimiento "30 Oct 2027"