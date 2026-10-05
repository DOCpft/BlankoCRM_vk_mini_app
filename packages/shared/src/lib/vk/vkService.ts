import vkBridge from '@vkontakte/vk-bridge';
import type { IVkService, VkLaunchParams } from './IVkService';

/**
 * Читаем параметры запуска из произвольной строки URL, включая query (`?`) и
 * hash (`#`) — VK может передать их в любом из этих мест. `sign` не начинается
 * с `vk_`, но обязателен для проверки подписи на бэкенде.
 */
function readLaunchParams(href: string): VkLaunchParams {
  const queryIndex = href.indexOf('?');
  const hashIndex = href.indexOf('#');
  const query = queryIndex === -1 ? '' : href.slice(queryIndex + 1);
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex + 1);
  const combined = `${query}&${hash}`;

  const params: VkLaunchParams = {};
  new URLSearchParams(combined).forEach((paramValue, rawKey) => {
    const key = rawKey.slice(rawKey.lastIndexOf('?') + 1);
    if (key.startsWith('vk_') || key === 'sign') params[key] = paramValue;
  });
  return params;
}

/**
 * Параметры запуска приходят в URL при открытии мини-приложения.
 * Считываем их один раз при загрузке модуля — до того, как роутер приложения
 * выполнит редирект и затрёт query-строку (например, "/" -> "/login").
 * После этого window.location.search уже пуст, и повторное чтение даёт {}.
 */
const isClient = typeof window !== 'undefined';
const initialHref = isClient ? window.location.href : '';
const initialLaunchParams: VkLaunchParams = readLaunchParams(initialHref);

/**
 * Диагностика окружения запуска. Логируется один раз при загрузке — когда URL
 * ещё оригинальный. Помогает понять, открыто ли приложение внутри VK.
 * TODO: удалить после отладки авторизации через VK.
 */
if (isClient) {
  const vkTs = initialLaunchParams.vk_ts;
  const nowUnix = Math.floor(Date.now() / 1000);
  console.info('[VK] launch diagnostics', {
    href: initialHref,
    referrer: document.referrer,
    hasLaunchParams: Object.keys(initialLaunchParams).length > 0,
    launchParamKeys: Object.keys(initialLaunchParams),
    embedded: vkBridge.isEmbedded(),
    isIframe: vkBridge.isIframe(),
    isWebView: vkBridge.isWebView(),
    nowUnix,
    vkTs: vkTs ?? null,
    vkTsAgeSec: vkTs ? nowUnix - Number(vkTs) : null,
  });
}

let initPromise: Promise<void> | null = null;

function isAvailable(): boolean {
  return vkBridge.isEmbedded() || 'vk_user_id' in initialLaunchParams;
}

async function getLaunchParamsFromBridge(): Promise<VkLaunchParams> {
  if (!vkBridge.isEmbedded()) return {};
  try {
    const data = await vkBridge.send('VKWebAppGetLaunchParams');
    const params: VkLaunchParams = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params[key] = String(value);
    });
    return params;
  } catch (error) {
    console.warn('VK Bridge: не удалось получить параметры запуска', error);
    return {};
  }
}

export const vkService: IVkService = {
  async init() {
    if (!vkBridge.isEmbedded()) return;
    // Инициализируем bridge один раз и переиспользуем промис,
    // чтобы getLaunchParams дождался готовности моста.
    if (!initPromise) {
      initPromise = vkBridge
        .send('VKWebAppInit')
        .then(() => undefined)
        .catch((error: unknown) => {
          console.warn('VK Bridge: не удалось инициализировать', error);
        });
    }
    await initPromise;
  },

  async getLaunchParams(): Promise<VkLaunchParams> {
    // Основной источник — параметры, полученные при запуске мини-приложения
    // (в них есть подписанный `sign`, необходимый бэкенду для проверки).
    if (Object.keys(initialLaunchParams).length > 0) return initialLaunchParams;

    // Фолбэк для WebView (мобильные приложения VK), где параметров нет в URL.
    await vkService.init();
    const bridgeParams = await getLaunchParamsFromBridge();
    if (Object.keys(bridgeParams).length > 0) return bridgeParams;

    // Параметров нет ни в URL, ни в bridge — скорее всего приложение открыто
    // вне VK (обычная вкладка браузера). Логируем окружение для диагностики.
    console.warn('VK: параметры запуска не получены', {
      initialUrl: initialHref,
      currentUrl: isClient ? window.location.href : '',
      embedded: vkBridge.isEmbedded(),
      isIframe: vkBridge.isIframe(),
      webView: vkBridge.isWebView(),
    });
    return {};
  },

  async allowNotifications() {
    if (!isAvailable()) return false;
    const response = await vkBridge.send('VKWebAppAllowNotifications');
    return 'result' in response && response.result === true;
  },

  isWebView: () => vkBridge.isWebView(),
  isAvailable,
};
