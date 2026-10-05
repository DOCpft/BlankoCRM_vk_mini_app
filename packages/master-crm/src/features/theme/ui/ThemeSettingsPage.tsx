import { THEMES } from '../../../entities/theme/model/themes';
import { useThemeStore } from '../../../entities/theme/model/themeStore';

export function ThemeSettingsPage() {
  const themeId = useThemeStore((state) => state.themeId);
  const setThemeId = useThemeStore((state) => state.setThemeId);

  return (
    <section className="crm-page">
      <header className="crm-page__header">
        <div>
          <h1>Оформление</h1>
          <p>Выберите тему интерфейса</p>
        </div>
      </header>
      <div className="crm-theme-options" role="radiogroup" aria-label="Тема оформления">
        {THEMES.map((theme) => {
          const isActive = theme.id === themeId;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`crm-theme-option ${isActive ? 'crm-theme-option--active' : ''}`}
              onClick={() => setThemeId(theme.id)}
            >
              <span
                className={`crm-theme-option__preview crm-theme-option__preview--${theme.id}`}
                aria-hidden="true"
              >
                <span className="crm-theme-option__dot" />
              </span>
              <span className="crm-theme-option__body">
                <strong>{theme.label}</strong>
                <small>{theme.description}</small>
              </span>
              <span className="crm-theme-option__check" aria-hidden="true">
                {isActive ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>
      <p className="crm-settings-note">Тема применяется сразу и сохраняется в этом браузере.</p>
    </section>
  );
}
