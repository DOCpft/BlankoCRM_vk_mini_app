import { AppRouter } from './app/router/AppRouter';
import { AppProvider } from './app/providers/AppProvider';
import { ThemeProvider } from './app/providers/ThemeProvider';

export function AppConfig() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ThemeProvider>
  );
}
