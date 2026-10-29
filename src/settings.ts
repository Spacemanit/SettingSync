// types of languages
export const LANGUAGES = {
  en: 'English',
  es: 'Español',
  hi: 'हिन्दी',
  ja: '日本語',
} as const;

// types of fonts
export const FONTS = {
  system: { name: 'System default', family: "'Segoe UI', 'Noto Sans', sans-serif" },
  arial: { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  georgia: { name: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
  verdana: { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  courier: { name: 'Courier New', family: "'Courier New', Courier, monospace" },
} as const;

export type Language = keyof typeof LANGUAGES;
export type FontFamily = keyof typeof FONTS;

// settings
export interface Settings {
  darkMode: boolean;
  fontFamily: FontFamily;
  language: Language;
  fontSize: number;
}

export type SettingKey = keyof Settings;

export type SettingsMessage =
  | { type: 'REQUEST_SETTINGS' }
  | { type: 'SETTING_UPDATED'; setting: SettingKey; value: unknown; persisted: boolean };

export const SETTING_KEYS: readonly SettingKey[] = ['darkMode', 'fontFamily', 'language', 'fontSize'];

//defaults
export const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  fontFamily: 'system',
  language: 'en',
  fontSize: 16,
};

// languages
const en = {
  openTab: 'Open another tab',
  title: 'Settings',
  description: 'Changes apply to all open tabs.',
  darkMode: 'Dark mode',
  darkModeHelp: 'Use a dark color scheme.',
  fontFamily: 'Font',
  fontFamilyHelp: 'Choose a font for the app.',
  systemFont: 'System default',
  language: 'Language',
  languageHelp: 'Choose your display language.',
  typography: 'Text size',
  typographyHelp: 'Adjust text throughout the app.',
  unsaved: 'Storage is unavailable. Changes may be lost when you close your tabs.',
  offline: 'Tab sync is unavailable in this browser.',
};

export type TranslationKey = keyof typeof en;
type Translation = Record<TranslationKey, string>;

const es: Translation = {
  openTab: 'Abrir otra pestaña', title: 'Ajustes', description: 'Los cambios se aplican a todas las pestañas abiertas.',
  darkMode: 'Modo oscuro', darkModeHelp: 'Usar una combinación de colores oscura.',
  fontFamily: 'Fuente', fontFamilyHelp: 'Elige una fuente para la aplicación.', systemFont: 'Del sistema',
  language: 'Idioma', languageHelp: 'Elige el idioma de la interfaz.',
  typography: 'Tamaño del texto', typographyHelp: 'Ajusta el texto en toda la aplicación.',
  unsaved: 'El almacenamiento no está disponible. Los cambios pueden perderse al cerrar las pestañas.',
  offline: 'La sincronización no está disponible en este navegador.',
};

const hi: Translation = {
  openTab: 'एक और टैब खोलें', title: 'सेटिंग्स', description: 'बदलाव सभी खुले टैब में लागू होते हैं।',
  darkMode: 'डार्क मोड', darkModeHelp: 'गहरे रंगों वाली थीम का उपयोग करें।',
  fontFamily: 'फ़ॉन्ट', fontFamilyHelp: 'ऐप के लिए फ़ॉन्ट चुनें।', systemFont: 'सिस्टम डिफ़ॉल्ट',
  language: 'भाषा', languageHelp: 'इंटरफ़ेस की भाषा चुनें।',
  typography: 'अक्षरों का आकार', typographyHelp: 'पूरे ऐप में अक्षरों का आकार बदलें।',
  unsaved: 'स्टोरेज उपलब्ध नहीं है। टैब बंद करने पर बदलाव खो सकते हैं।',
  offline: 'इस ब्राउज़र में टैब सिंक उपलब्ध नहीं है।',
};

const ja: Translation = {
  openTab: '別のタブを開く', title: '設定', description: '変更は開いているすべてのタブに反映されます。',
  darkMode: 'ダークモード', darkModeHelp: '暗い配色を使用します。',
  fontFamily: 'フォント', fontFamilyHelp: 'アプリで使用するフォントを選びます。', systemFont: 'システム標準',
  language: '言語', languageHelp: '表示する言語を選びます。',
  typography: '文字の大きさ', typographyHelp: 'アプリ全体の文字の大きさを調整します。',
  unsaved: 'ストレージを利用できません。タブを閉じると変更が失われる場合があります。',
  offline: 'このブラウザーではタブを同期できません。',
};

export const translations: Record<Language, Translation> = { en, es, hi, ja };
