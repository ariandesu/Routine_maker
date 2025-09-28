'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = string;
type Font = string;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  font: Font;
  setFont: (font: Font) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('theme-indigo');
  const [font, setFontState] = useState<Font>('font-body');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('timetable-theme') as Theme | null;
    const storedFont = localStorage.getItem('timetable-font') as Font | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    if (storedFont) {
      setFontState(storedFont);
    }
    setIsMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timetable-theme', newTheme);
    }
  };

  const setFont = (newFont: Font) => {
    setFontState(newFont);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timetable-font', newFont);
    }
  };
  
  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
