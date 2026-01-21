'use client'

import { useThemeStore } from '@/stores/useThemeStore'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-4 transition-colors cursor-pointer"
      aria-label={`${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-warning" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </button>
  )
}
