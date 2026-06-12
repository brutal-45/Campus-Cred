'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';

/**
 * ThemeToggle
 *
 * A clean sun/moon toggle that switches between light and dark mode.
 * Uses the Zustand store's isDarkMode + toggleDarkMode.
 * Styled to work on both white (light) and navy (dark) backgrounds.
 */
export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="relative h-9 w-9 rounded-full dark:hover:bg-white/10 dark:text-white/70 dark:hover:text-white hover:bg-navy/5 text-text-secondary hover:text-navy transition-colors"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4 text-navy" />
      )}
    </Button>
  );
}
