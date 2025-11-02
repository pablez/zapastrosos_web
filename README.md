# 👟 Zapastroso - E-commerce de Zapatos

## 🎯 **Descripción del Proyecto**

**Zapastroso** es una plataforma de e-commerce moderna especializada en la venta de zapatos, desarrollada con React, Firebase y Tailwind CSS. Ofrece una experiencia de compra completa con panel de administración, gestión de inventario y procesamiento de pedidos.

## ⚡ **Tecnologías Utilizadas**

### **Frontend:**
- **React 18** - Library principal para UI
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS v4** - Framework de estilos
- **React Router** - Navegación SPA
- **Lucide React** - Iconografía moderna

### **Backend & Servicios:**
- **Firebase Authentication** - Sistema de autenticación
- **Cloud Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de imágenes
- **Firebase Hosting** - Hosting web
- **Firebase Functions** - Lógica del servidor

### **Herramientas de Desarrollo:**
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **Firebase CLI** - Administración de Firebase

## 🏗️ **Arquitectura del Proyecto**

```
zapastrosos-web/
├── src/
│   ├── components/
│   │   ├── shop/          # Componentes de la tienda
│   │   ├── admin/         # Panel de administración
│   │   ├── auth/          # Autenticación
│   │   └── common/        # Componentes compartidos
│   ├── contexts/          # Context API (Auth, Cart)
│   ├── services/          # Servicios de Firebase
│   └── assets/           # Recursos estáticos
├── public/
│   └── images/           # Imágenes públicas
├── functions/            # Firebase Cloud Functions
└── docs/                # Documentación
```

## 🚀 **Instalación y Configuración**

### **Prerrequisitos:**
- Node.js 18+ y npm
- Cuenta de Firebase
- Git

### **1. Clonar el Repositorio:**
```bash
git clone https://github.com/pablez/zapastrosos-web.git
cd zapastrosos-web
```

### **2. Instalar Dependencias:**
```bash
npm install
```

### **3. Configurar Firebase:**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto
firebase init
```

### **4. Configurar Variables de Entorno:**
Crear archivo `.env` con las credenciales de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### **5. Ejecutar en Desarrollo:**
```bash
npm run dev
```

## 👨‍💼 **Configuración del Administrador**

### **Crear Primer Administrador:**
1. Ve a: `http://localhost:5173/admin-setup`
2. Usa el código secreto: `ZAPASTROSO_ADMIN_2025`
3. Completa el formulario de registro
4. ¡Listo! Serás redirigido al panel de admin

### **Login de Administrador:**
- URL: `http://localhost:5173/login`
- Credenciales: Las que creaste en el paso anterior

## 🛍️ **Características Principales**

### **Para Clientes:**
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras persistente
- ✅ Proceso de checkout
- ✅ Historial de pedidos
- ✅ Sistema de reviews
- ✅ Búsqueda avanzada

### **Para Administradores:**
- ✅ Gestión completa de productos
- ✅ Administración de categorías
- ✅ Control de inventario
- ✅ Gestión de pedidos
- ✅ Analytics y reportes
- ✅ Gestión de usuarios

## 🔐 **Seguridad y Permisos**

### **Reglas de Firestore:**
- **Productos:** Lectura pública, escritura solo admins
- **Pedidos:** Usuarios ven solo los suyos, admins ven todos
- **Carritos:** Solo el propietario puede acceder
- **Usuarios:** Acceso propio + admin oversight

### **Autenticación:**
- Sistema de roles (admin/usuario)
- Protección de rutas administrativas
- Validación de permisos en tiempo real

## 📦 **Scripts Disponibles**

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run preview         # Preview del build

# Firebase
firebase serve          # Servir localmente
firebase deploy         # Deploy a producción
firebase deploy --only hosting  # Solo hosting
firebase deploy --only firestore:rules  # Solo reglas

# Utilidades
npm run lint           # Verificar código
npm run lint:fix       # Corregir errores automáticos
```

## 🌐 **URLs del Proyecto**

### **Desarrollo:**
- **Tienda:** `http://localhost:5173/`
- **Admin Setup:** `http://localhost:5173/admin-setup`
- **Login Admin:** `http://localhost:5173/login`
- **Panel Admin:** `http://localhost:5173/admin`

### **Producción:**
- **URL:** `https://zapastrosos-web.web.app`
- **Firebase Console:** [Consola de Firebase](https://console.firebase.google.com/project/zapastrosos-web)

## 📊 **Estado del Proyecto**

### **✅ Completado:**
- [x] Configuración inicial de React + Vite
- [x] Integración con Firebase (Auth, Firestore, Storage)
- [x] Sistema de autenticación completo
- [x] Reglas de seguridad de Firestore
- [x] Panel de administrador funcional
- [x] Diseño responsive con Tailwind CSS

- ### **🚧 En Desarrollo / Notas:**
- [ ] Población de datos (la UI de inicialización fue removida; usar scripts o la consola de Firebase)
- [ ] Testing integral del sistema
- [ ] Optimizaciones de rendimiento
- [ ] Deploy de producción

### **📅 Próximas Funcionalidades:**
- [ ] Integración de pagos (Stripe/PayPal)
- [ ] Notificaciones push
- [ ] Sistema de cupones
- [ ] Chat de soporte
- [ ] App móvil con React Native

## 🤝 **Contribución**

### **Para Contribuir:**
1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

### **Estándares de Código:**
- Usar ESLint para consistency
- Componentes funcionales con hooks
- Naming conventions: camelCase para variables, PascalCase para componentes
- Comentarios en español
- Props validation con PropTypes

## 📞 **Soporte y Contacto**

### **Desarrollador:**
- **Email:** dev@zapastroso.com
- **GitHub:** [@pablez](https://github.com/pablez)

### **Documentación Adicional:**
- [Guía de Configuración de Admin](./ADMIN_SETUP.md)
- [Debug de Login](./LOGIN_DEBUG.md)
- [Reglas de Firestore](./FIREBASE_RULES.md)

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más detalles.

---

**🚀 ¡Zapastroso - Donde cada paso cuenta!** 👟
