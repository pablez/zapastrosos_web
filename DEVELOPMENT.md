# 🚀 Project Kicks - Guía de Desarrollo

## ✅ Estado del Proyecto

### Completado
- ✅ Proyecto React con Vite inicializado
- ✅ Estructura de carpetas según especificación
- ✅ Dependencias instaladas (React Router, Firebase, Lucide Icons, EmailJS)
- ✅ Tailwind CSS configurado
- ✅ Contextos de autenticación y carrito implementados
- ✅ Componentes básicos creados (páginas principales y admin)
- ✅ Rutas configuradas
- ✅ Archivos de configuración de Firebase listos

### Por Hacer
- ⏳ Configurar proyecto Firebase en la consola
- ⏳ Completar variables de entorno
- ⏳ Implementar funcionalidades completas
- ⏳ Agregar datos de prueba

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la construcción
npm run preview
```

## 🔧 Configuración Inicial Requerida

### 1. Configurar Firebase

1. **Crear proyecto en Firebase Console**:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto llamado "project-kicks"
   - Habilita Google Analytics (opcional)

2. **Configurar servicios**:
   - **Authentication**: Habilitar email/password
   - **Firestore Database**: Crear en modo prueba
   - **Storage**: Habilitar para imágenes
   - **Analytics**: Configurar (opcional)

3. **Obtener credenciales**:
   - Ve a Configuración del proyecto > General
   - En "Tus aplicaciones" > Agregar aplicación web
   - Copia las credenciales de configuración

### 2. Configurar Variables de Entorno

1. Copia `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Completa las variables en `.env` con tus credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=project-kicks.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=project-kicks
   # ... etc
   ```

### 3. Configurar Reglas de Firestore

```javascript
// Reglas básicas de seguridad para Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de productos
    match /tenis/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /variantes/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Solo admins pueden gestionar pedidos
    match /pedidos/{document} {
      allow read, write: if isAdmin();
    }
    
    // Solo admins pueden ver la lista de admins
    match /administradores/{document} {
      allow read: if isAdmin();
      allow write: if false; // Solo desde consola
    }
    
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/administradores/$(request.auth.uid));
    }
  }
}
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   ├── shop/           # Componentes de la tienda
│   ├── admin/          # Componentes del panel admin
│   └── auth/           # Componentes de autenticación
├── hooks/              # Custom hooks
├── services/           # Servicios de Firebase
├── utils/              # Utilidades y helpers
├── contexts/           # Context API para estado global
└── styles/             # Estilos globales
```

## 🎯 Próximos Pasos para el Desarrollo

### Fase 1: Configuración Firebase
1. Configurar proyecto Firebase
2. Actualizar variables de entorno
3. Probar conexión a Firebase
4. Crear primer usuario administrador

### Fase 2: CRUD de Productos
1. Implementar gestión de productos en admin
2. Crear formularios para añadir/editar productos
3. Implementar carga de imágenes
4. Añadir productos de prueba

### Fase 3: Catálogo Público
1. Mostrar productos en el catálogo
2. Implementar filtros y búsqueda
3. Crear página de detalle del producto
4. Implementar carrito de compras funcional

## 🔗 URLs de la Aplicación

- **Tienda Principal**: http://localhost:5173/
- **Catálogo**: http://localhost:5173/catalogo
- **Login Admin**: http://localhost:5173/login
- **Panel Admin**: http://localhost:5173/admin

## 📋 Checklist de Testing

### Testing Manual
- [ ] Página principal carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Login de admin muestra formulario
- [ ] Panel admin requiere autenticación
- [ ] Carrito mantiene estado
- [ ] Diseño responsive en móvil

### Testing Firebase
- [ ] Conexión a Firestore establecida
- [ ] Autenticación funciona
- [ ] Lectura de productos
- [ ] Escritura de productos (admin)
- [ ] Subida de imágenes a Storage

## 🎨 Personalización del Tema

El proyecto usa Tailwind CSS con colores personalizados:
- **Primary**: Azul (#3b82f6)
- **Secondary**: Gris
- **Success**: Verde
- **Warning**: Amarillo
- **Error**: Rojo

Para cambiar los colores, edita `tailwind.config.js`.

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que todas las dependencias estén instaladas
2. Confirma que las variables de entorno estén configuradas
3. Revisa la consola del navegador para errores
4. Verifica la configuración de Firebase

---

*¡Happy coding! 🚀*