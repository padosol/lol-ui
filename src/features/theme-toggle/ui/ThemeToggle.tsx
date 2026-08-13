'use client'

import { useThemeStore } from '../model/useThemeStore'
import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const t = useTranslations('theme')

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-4 transition-colors cursor-pointer"
      aria-label={theme === 'dark' ? t('toLight') : t('toDark')}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-warning" />
      ) : (
        <Moon className="w-5 h-5 text-warning" />
      )}
    </button>
  )
}
