import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Componentes de iconos
const SunIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2"/>
    <path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/>
    <path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/>
    <path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/>
    <path d="M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const ThemeToggle = ({ size = 24, className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('ThemeToggle clicked. Current theme:', theme); // Debug
    toggleTheme();
  };

  console.log('ThemeToggle rendered. Current theme:', theme); // Debug

  return (
    <button
      onClick={handleClick}
      className={`p-3 rounded-full transition-all duration-300 hover:shadow-md ${
        theme === 'light' 
          ? 'text-yellow-600 hover:bg-yellow-50 bg-yellow-100' 
          : 'text-blue-400 hover:bg-gray-700 bg-gray-800'
      } ${className}`}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {theme === 'light' ? <MoonIcon size={size} /> : <SunIcon size={size} />}
    </button>
  );
};

export default ThemeToggle;