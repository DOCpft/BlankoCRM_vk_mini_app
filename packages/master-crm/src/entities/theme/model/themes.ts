export type ThemeId = 'light' | 'dark' | 'rose';

export type ThemeColorScheme = 'light' | 'dark';

export interface ThemeDefinition {
  readonly id: ThemeId;
  readonly label: string;
  readonly description: string;
  readonly colorScheme: ThemeColorScheme;
}

export const DEFAULT_THEME_ID: ThemeId = 'light';

/**
 * Список доступных тем. Значения `id` должны совпадать с селекторами
 * `[data-crm-theme="..."]` в `packages/shared/src/config/themes.css`.
 */
export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'light',
    label: 'Светлая',
    description: 'Классический светлый интерфейс',
    colorScheme: 'light',
  },
  {
    id: 'dark',
    label: 'Тёмная',
    description: 'Приглушённые поверхности, комфортно вечером',
    colorScheme: 'dark',
  },
  {
    id: 'rose',
    label: 'Розовая',
    description: 'Тёплая пастельная палитра',
    colorScheme: 'light',
  },
];

const THEME_IDS = new Set<string>(THEMES.map((theme) => theme.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.has(value);
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
