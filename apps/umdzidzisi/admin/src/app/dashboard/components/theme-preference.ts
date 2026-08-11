/**
 * Local theme-preference helpers for the umdzidzisi admin app. Kept out of the
 * shared ThemeService (used by other apps) so persistence/system detection stay
 * app-scoped. `mode` is the user's choice; the resolved theme name is what gets
 * handed to `ThemeService.setTheme(...)`.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export const LIGHT_THEME: string = 'umdzidzisi';
export const DARK_THEME: string = 'umdzidzisi-dark';
const STORAGE_KEY: string = 'umdzidzisi-theme-mode';

const MODES: ReadonlySet<ThemeMode> = new Set<ThemeMode>([
  'light',
  'dark',
  'system',
]);

/** Reads the saved mode, defaulting to 'system' (follow the OS). */
export function readMode(): ThemeMode {
  if (typeof localStorage === 'undefined') {
    return 'system';
  }
  const saved: string | null = localStorage.getItem(STORAGE_KEY);
  return saved && MODES.has(saved as ThemeMode) ? (saved as ThemeMode) : 'system';
}

/** Persists the chosen mode. */
export function saveMode(mode: ThemeMode): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

/** Whether the OS currently prefers a dark color scheme. */
export function systemPrefersDark(): boolean {
  return (
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** Resolves a mode to a concrete theme name for ThemeService.setTheme(). */
export function resolveTheme(mode: ThemeMode): string {
  const dark: boolean = mode === 'dark' || (mode === 'system' && systemPrefersDark());
  return dark ? DARK_THEME : LIGHT_THEME;
}
