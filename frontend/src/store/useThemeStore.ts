import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: () => 'dark' | 'light';
}

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        document.documentElement.classList.toggle('dark', resolved === 'dark');
      },
      resolvedTheme: () => {
        const { theme } = get();
        return theme === 'system' ? getSystemTheme() : theme;
      },
    }),
    { name: 'theme-preference' }
  )
);

/** Call once on app boot to apply the persisted theme */
export function applyStoredTheme() {
  const stored = localStorage.getItem('theme-preference');
  let theme: Theme = 'system';
  if (stored) {
    try { theme = JSON.parse(stored).state?.theme ?? 'system'; } catch {}
  }
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');

  // Keep system theme in sync with OS preference changes
  if (theme === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const currentStored = localStorage.getItem('theme-preference');
      let currentTheme: Theme = 'system';
      if (currentStored) {
        try { currentTheme = JSON.parse(currentStored).state?.theme ?? 'system'; } catch {}
      }
      if (currentTheme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    });
  }
}
