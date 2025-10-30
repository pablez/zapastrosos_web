# 🏪 Logo "Zapastroso" - Guía de Implementación

## 📁 Ubicación del Logo

Coloca tu logo en la siguiente ruta:
```
public/images/logos/zapastroso-logo.png
```

## 📐 Formatos Recomendados

### Archivos de Logo Necesarios:

1. **`zapastroso-logo.png`** (Principal)
   - Formato: PNG con transparencia
   - Tamaño: 400x120px (aprox)
   - Uso: Logo principal en header

2. **`zapastroso-logo-white.png`** (Opcional)
   - Formato: PNG con transparencia
   - Logo en blanco para fondos oscuros
   - Mismo tamaño que el principal

3. **`zapastroso-icon.png`** (Favicon)
   - Formato: PNG cuadrado
   - Tamaño: 512x512px
   - Uso: Favicon e icono de la app

4. **`zapastroso-logo.svg`** (Recomendado)
   - Formato: SVG vectorial
   - Escalable sin pérdida de calidad
   - Menor peso de archivo

## 🎨 Especificaciones de Diseño

### Dimensiones Recomendadas:
- **Ancho máximo**: 200px en el header
- **Alto máximo**: 40px en el header
- **Aspecto**: Mantener proporciones originales

### Consideraciones:
- Fondo transparente
- Buena legibilidad en tamaños pequeños
- Contraste adecuado con fondo blanco
- Versión alternativa para fondos oscuros

## 🔧 Implementación en el Código

Una vez que coloques el logo en `public/images/logos/`, se mostrará automáticamente en:

1. **Header principal** (ya implementado)
2. **Panel de administración**
3. **Favicon** (requiere configuración adicional)

### Fallback Automático:
Si el logo no existe, se mostrará el texto "👟 Zapastroso" como respaldo.

## 📱 Responsive Design

El logo se adapta automáticamente:
- **Desktop**: Tamaño completo
- **Tablet**: Tamaño reducido
- **Mobile**: Solo icono o logo compacto

## 🔗 Referencias en el Código

```jsx
// Uso principal en Header
<img 
  src="/images/logos/zapastroso-logo.png" 
  alt="Zapastroso Logo" 
  className="h-10 w-auto"
/>

// Para favicon (en index.html)
<link rel="icon" type="image/png" href="/images/logos/zapastroso-icon.png">
```

## ✅ Checklist de Implementación

- [ ] Colocar logo principal en `public/images/logos/zapastroso-logo.png`
- [ ] Verificar que se vea correctamente en el header
- [ ] Opcionalmente añadir versión blanca
- [ ] Configurar favicon
- [ ] Probar en diferentes tamaños de pantalla

---

**Nota**: Una vez que coloques el archivo del logo, refrescará la página y se verá automáticamente. ¡No olvides usar un diseño que represente bien la marca "Zapastroso"! 👟