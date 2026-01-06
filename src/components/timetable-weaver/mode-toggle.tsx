
'use client'

import { useEffect, useState } from 'react'

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkModePreferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && isDarkModePreferred)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light');
    }
  }, [isDark])

  return (
    <input
      type="checkbox"
      className="theme-checkbox"
      checked={isDark}
      onChange={(e) => setIsDark(e.target.checked)}
      title={isDark ? "Activate light mode" : "Activate dark mode"}
    />
  )
}
