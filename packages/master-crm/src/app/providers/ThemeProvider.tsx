import { useLayoutEffect, type ReactNode } from 'react';
import { ConfigProvider } from '@vkontakte/vkui';
import { useThemeStore } from '../../entities/theme/model/themeStore';
import { getTheme } from '../../entities/theme/model/themes';

/**
 * Применяет выбранную тему: выставляет `data-crm-theme` на `<html>`
 * (переключает CSS-переменные `--crm-*`) и синхронизирует цветовую схему vkui,
 * чтобы кнопки/поля/селекты тоже перекрашивались.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeId = useThemeStore((state) => state.themeId);
  const theme = getTheme(themeId);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-crm-theme', theme.id);
  }, [theme.id]);

  return (
    <ConfigProvider colorScheme={theme.colorScheme}>
      <div className="crm-app">{children}</div>
    </ConfigProvider>
  );
}
