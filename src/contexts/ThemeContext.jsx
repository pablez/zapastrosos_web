import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Inicializar tema desde localStorage o detectar preferencia del sistema
  const [theme, setTheme] = useState(() => {
    // Verificar si hay tema guardado
    const savedTheme = localStorage.getItem('zapastroso-theme');
    console.log('💾 Tema guardado en localStorage:', savedTheme);
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('🌙 Detectada preferencia del sistema: dark');
      return 'dark';
    }
    
    console.log('☀️ Usando tema por defecto: light');
    return 'light';
  });

  // Función para aplicar tema inmediatamente
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    const body = document.body;
    
    console.log('🎨 Aplicando tema:', newTheme);
    console.log('📋 Clases antes:', root.className);
    
    // Remover todas las clases de tema
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Agregar la clase del tema actual
    root.classList.add(newTheme);
    body.classList.add(newTheme);
    
    // Aplicar estilos directamente para forzar el cambio
    if (newTheme === 'dark') {
      root.style.colorScheme = 'dark';
      body.style.backgroundColor = '#111827';
      body.style.color = '#f9fafb';
      root.setAttribute('data-theme', 'dark');
    } else {
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '#f9fafb';
      body.style.color = '#111827';
      root.setAttribute('data-theme', 'light');
    }
    
    console.log('✅ Tema aplicado. Clases del HTML:', root.className);
    console.log('📊 Data-theme:', root.getAttribute('data-theme'));
    
    // Forzar repaint
    root.style.display = 'none';
    root.offsetHeight; // trigger reflow
    root.style.display = '';
  };

  // Aplicar tema inicial inmediatamente
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Aplicar tema al documento cuando cambie
  useEffect(() => {
    applyTheme(theme);
    
    // Guardar en localStorage
    localStorage.setItem('zapastroso-theme', theme);
    
    // Disparar evento personalizado para que otros componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Solo cambiar si no hay tema guardado explícitamente
      const savedTheme = localStorage.getItem('zapastroso-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    console.log('🔄 Toggle theme llamado. Tema actual:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log('🔄 Cambiando a tema:', newTheme);
  };

  const setLightTheme = () => {
    setTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
  };

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;