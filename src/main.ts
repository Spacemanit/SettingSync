import { DEFAULT_SETTINGS, FONTS, LANGUAGES, SETTING_KEYS, STORAGE_PREFIX, translations } from './settings';
import type { FontFamily, Language, LegacySettings, SettingKey, Settings, SettingsMessage, TranslationKey } from './settings';

let settings: Settings = { ...DEFAULT_SETTINGS };
let channel: BroadcastChannel | null = null;
let storageAvailable = true;

const app = document.querySelector<HTMLDivElement>('#app');
const darkMode = document.querySelector<HTMLInputElement>('#dark-mode')!;
const fontFamily = document.querySelector<HTMLSelectElement>('#font-family')!;
const language = document.querySelector<HTMLSelectElement>('#language')!;
const fontSize = document.querySelector<HTMLInputElement>('#font-size')!;

// No argument loads every preference at startup. A setting name loads only that preference.
export function loadSettings(changedSetting?: SettingKey, unsavedValue?: unknown): void {
  const keys = changedSetting ? [changedSetting] : SETTING_KEYS;

  for (const key of keys) {
    let value = unsavedValue;
    if (value === undefined) {
      let saved: string | null;
      try {
        saved = localStorage.getItem(STORAGE_PREFIX + key);
      } catch {
        storageAvailable = false;
        continue;
      }
      try {
        value = saved === null ? DEFAULT_SETTINGS[key] : JSON.parse(saved);
      } catch {
        value = DEFAULT_SETTINGS[key];
      }
    }

    const valid = (key === 'darkMode' && typeof value === 'boolean') ||
      (key === 'fontFamily' && typeof value === 'string' && Object.hasOwn(FONTS, value)) ||
      (key === 'language' && typeof value === 'string' && Object.hasOwn(LANGUAGES, value)) ||
      (key === 'fontSize' && typeof value === 'number' && Number.isInteger(value) && value >= 14 && value <= 22);
    if (valid) settings = { ...settings, [key]: value };
  }

  const root = document.documentElement;
  root.dataset.theme = settings.darkMode ? 'dark' : 'light';
  root.lang = settings.language;
  root.style.fontSize = `${settings.fontSize}px`;
  root.style.setProperty('--font-family', FONTS[settings.fontFamily].family);
  root.style.colorScheme = settings.darkMode ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content', settings.darkMode ? '#172b23' : '#f6f0df',
  );

  if (!app) return;

  const text = translations[settings.language];
  document.querySelectorAll<HTMLElement>('[data-translation]').forEach((element) => {
    element.textContent = text[element.dataset.translation as TranslationKey];
  });
  document.querySelector('#settings-panel')!.setAttribute('aria-label', text.title);
  darkMode.checked = settings.darkMode;
  darkMode.setAttribute('aria-label', text.darkMode);
  fontFamily.options[0]!.textContent = text.systemFont;
  fontFamily.value = settings.fontFamily;
  language.value = settings.language;
  fontSize.value = String(settings.fontSize);
  fontSize.setAttribute('aria-valuetext', `${settings.fontSize}px`);
  fontSize.style.setProperty('--range-progress', `${(settings.fontSize - 14) / 8 * 100}%`);
  document.querySelector('#font-value')!.innerHTML = `${settings.fontSize}<span class="ml-[.2rem] text-[.8rem] font-normal text-cream-muted dark:text-algae-muted">px</span>`;

  const warning = document.querySelector<HTMLElement>('#storage-warning')!;
  warning.hidden = storageAvailable;
  warning.textContent = [!storageAvailable ? text.unsaved : '', !channel && !storageAvailable ? text.offline : '']
    .filter(Boolean).join(' ');
  app.hidden = false;
}

export function storeSettings<K extends SettingKey>(key: K, value: Settings[K]): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  loadSettings(key, storageAvailable ? undefined : value);

  try {
    channel?.postMessage({ type: 'SETTING_UPDATED', setting: key, value, persisted: storageAvailable });
  } catch { channel = null; }
}

// One-time compatibility step for preferences saved by the older app.
try {
  const missing = SETTING_KEYS.filter((key) => localStorage.getItem(STORAGE_PREFIX + key) === null);
  if (missing.length) {
    const legacy: Partial<Record<SettingKey, LegacySettings[SettingKey]>> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey?.startsWith('setting-sync:v1:writer:')) continue;
      try {
        const snapshot = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as LegacySettings | null;
        if (snapshot?.schema !== 1) continue;
        for (const key of missing) {
          const entry = snapshot[key];
          if (!entry?.version || !Number.isSafeInteger(entry.version.counter) ||
              entry.version.counter < 0 || typeof entry.version.actor !== 'string') continue;
          const previous = legacy[key];
          if (!previous || entry.version.counter > previous.version.counter ||
              (entry.version.counter === previous.version.counter && entry.version.actor > previous.version.actor)) {
            legacy[key] = entry;
          }
        }
      } catch { /* Ignore a damaged old snapshot. */ }
    }
    for (const key of missing) {
      if (legacy[key] && localStorage.getItem(STORAGE_PREFIX + key) === null) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(legacy[key].value));
      }
    }
  }
} catch { /* The loader handles unavailable storage. */ }

// Sets up the controls and listerners after the page is available
if (app) {
  fontFamily.innerHTML = Object.entries(FONTS).map(([value, font]) =>
    `<option value="${value}">${font.name}</option>`).join('');
  language.innerHTML = Object.entries(LANGUAGES).map(([value, name]) =>
    `<option value="${value}" lang="${value}">${name}</option>`).join('');

  try { 
    channel = new BroadcastChannel('my_app_channel');
  } catch {
    channel = null;
  }
  if (channel) {
    channel.onmessage = (event: MessageEvent<SettingsMessage>) => {
      const message = event.data;
      if (message?.type === 'REQUEST_SETTINGS') {
        for (const key of SETTING_KEYS) {
          channel?.postMessage({ type: 'SETTING_UPDATED', setting: key, value: settings[key], persisted: storageAvailable });
        }
      } else if (message?.type === 'SETTING_UPDATED' && SETTING_KEYS.includes(message.setting) &&
          typeof message.persisted === 'boolean') {
        if (!message.persisted) storageAvailable = false;
        // A message can arrive late. Read the saved value instead of trusting message order.
        loadSettings(message.setting, message.persisted ? undefined : message.value);
      }
    };
    channel.postMessage({ type: 'REQUEST_SETTINGS' });
  }

  darkMode.onchange = () => storeSettings('darkMode', darkMode.checked);
  fontFamily.onchange = () => storeSettings('fontFamily', fontFamily.value as FontFamily);
  language.onchange = () => storeSettings('language', language.value as Language);
  fontSize.oninput = () => storeSettings('fontSize', Number(fontSize.value));
  document.querySelector<HTMLButtonElement>('#open-tab')!.onclick = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  window.addEventListener('storage', (event) => {
    if (event.storageArea !== localStorage) return;
    if (event.key === null) {
      loadSettings();
      return;
    }
    const key = SETTING_KEYS.find((key) => event.key === STORAGE_PREFIX + key);
    if (key) loadSettings(key);
  });
  window.addEventListener('focus', () => loadSettings());
  window.addEventListener('pageshow', () => loadSettings());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') loadSettings();
  });
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) channel?.close();
  });
  if (import.meta.hot) import.meta.hot.dispose(() => channel?.close());
}
