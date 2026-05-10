import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  isDark: true,
  setTheme: () => null,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme-preference') || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme) => {
      const matchDark = currentTheme === 'dark' || (currentTheme === 'system' && mediaQuery.matches);
      
      if (matchDark) {
        root.classList.add('dark');
        setIsDark(true);
      } else {
        root.classList.remove('dark');
        setIsDark(false);
      }
    };

    applyTheme(theme);

    const listener = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const value = {
    theme,
    isDark,
    setTheme: (newTheme) => {
      localStorage.setItem('theme-preference', newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
