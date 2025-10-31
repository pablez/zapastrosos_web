import { useState, useEffect } from 'react';

export const useThemeListener = () => {
  const [themeUpdate, setThemeUpdate] = useState(0);

  useEffect(() => {
    const handleThemeChange = (event) => {
      console.log('🔔 Hook detectó cambio de tema:', event.detail.theme);
      setThemeUpdate(prev => prev + 1);
    };

    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return themeUpdate;
};

export default useThemeListener;