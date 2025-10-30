# 🔐 Configuración de Usuario Administrador

## 📋 Información de Acceso

### 🌐 URL de Configuración Inicial
```
http://localhost:5173/admin-setup
```

### 🔑 Código Secreto de Administrador
```
ZAPASTROSO_ADMIN_2025
```

## 📝 Pasos para Crear el Primer Admin

1. **Accede a la página de configuración:**
   - Ve a `http://localhost:5173/admin-setup`

2. **Completa el formulario:**
   - **Nombre:** Tu nombre
   - **Apellido:** Tu apellido  
   - **Email:** El email que usarás como admin
   - **Contraseña:** Mínimo 6 caracteres
   - **Confirmar Contraseña:** Repite la contraseña
   - **Código Secreto:** `ZAPASTROSO_ADMIN_2025`

3. **Haz clic en "Crear Administrador"**

4. **¡Listo!** El usuario admin se creará automáticamente con:
   - Rol: `admin`
   - Permisos completos
   - Acceso al panel de administración

## 🛡️ Características de Seguridad

### ✅ Protecciones Implementadas:
- ✅ Solo se puede crear **UN** usuario admin
- ✅ Requiere código secreto para crear admin
- ✅ Validación de contraseñas seguras
- ✅ Verificación de duplicados de email
- ✅ Auto-redirección al panel admin tras creación

### 🚨 Importante:
- **Una vez creado el primer admin**, esta página debe ser removida o protegida
- Los siguientes admins se crean desde el panel de administración
- Guarda bien las credenciales del primer admin

## 🔧 Funcionalidades del Admin

El usuario admin tendrá acceso a:
- ✅ **Gestión de Productos** (crear, editar, eliminar)
- ✅ **Gestión de Categorías** 
- ✅ **Gestión de Pedidos** (ver, actualizar estado)
- ✅ **Gestión de Usuarios** (promover a admin, suspender)
- ✅ **Analytics y Reportes**
- ✅ **Configuración de la Tienda**

## 🌐 URLs de Acceso

```bash
# Página de configuración inicial (solo una vez)
http://localhost:5173/admin-setup

# Panel de administración (después de crear admin)
http://localhost:5173/admin

# Login general
http://localhost:5173/login

# Tienda principal
http://localhost:5173/
```

## 🔄 Estados de la Aplicación

### 1. **Primera Vez (Sin Admin)**
- Accede a `/admin-setup`
- Crea el primer administrador
- Se auto-redirige a `/admin`

### 2. **Ya Existe Admin**
- La página `/admin-setup` mostrará error si ya existe un admin
- Usa `/login` para acceder como admin
- Accede directamente a `/admin`

---

**💡 Tip:** Guarda este archivo como referencia para el proceso de configuración inicial.