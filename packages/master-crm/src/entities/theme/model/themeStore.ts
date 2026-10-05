import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_THEME_ID, isThemeId, type ThemeId } from './themes';

interface ThemeState {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
}

interface PersistedThemeState {
  themeId: ThemeId;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_THEME_ID,
      setThemeId: (themeId) => set({ themeId }),
    }),
    {
      name: 'blanko-crm-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ themeId }): PersistedThemeState => ({ themeId }),
      // Защищаемся от устаревшего/некорректного значения в localStorage.
      merge: (persisted, current) => {
        const themeId = (persisted as Partial<PersistedThemeState> | undefined)?.themeId;
        return { ...current, themeId: isThemeId(themeId) ? themeId : current.themeId };
      },
    },
  ),
);
