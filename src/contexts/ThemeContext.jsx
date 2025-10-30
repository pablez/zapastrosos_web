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
  // Inicializar tema desde localStorage o usar 'light' por defecto
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('zapastroso-theme');
    return savedTheme || 'light';
  });

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    
    console.log('Aplicando tema:', theme); // Debug
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('Clase dark agregada al HTML'); // Debug
    } else {
      root.classList.remove('dark');
      console.log('Clase dark removida del HTML'); // Debug
    }
    
    // Guardar en localStorage
    localStorage.setItem('zapastroso-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme llamado. Tema actual:', theme); // Debug
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
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