export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference;
}

/** Writes data-theme on <html>; the stylesheet keys everything off that. */
export function apply(preference: ThemePreference) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolve(preference));
}

export function savePreference(preference: ThemePreference) {
  if (typeof window === 'undefined') return;
  if (preference === 'system') {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
  apply(preference);
}

/**
 * Keeps "system" live: if the device flips to dark while the app is open and
 * the user has not made an explicit choice, follow it.
 */
export function watchSystem(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
