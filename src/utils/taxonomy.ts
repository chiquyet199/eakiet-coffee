// Enum values shared by the content schema (src/content/config.ts), the Decap select widgets
// (public/admin/config.yml) and the UI labels below. Changing a value means changing all three.

export const PRODUCT_LINES = {
  green: 'Cà phê nhân xanh',
  roasted: 'Cà phê rang xay',
  gift: 'Cà phê quà tặng',
} as const;

export const BEAN_TYPES = {
  robusta: 'Robusta',
  arabica: 'Arabica',
  blend: 'Phối trộn',
} as const;

export const PROCESS_METHODS = {
  natural: 'Natural',
  honey: 'Honey',
  washed: 'Washed',
} as const;

export const NEWS_CATEGORIES = {
  htx: 'Tin tức HTX',
  'kien-thuc': 'Kiến thức cà phê',
  'goc-nong-dan': 'Góc nông dân',
} as const;

export const AWARD_KINDS = {
  certification: 'Chứng nhận',
  award: 'Giải thưởng',
  legal: 'Hồ sơ pháp lý',
} as const;

export const FLAVOR_AXES = {
  bitterness: 'Độ đắng',
  acidity: 'Độ chua',
  sweetness: 'Độ ngọt',
  aroma: 'Hương thơm',
  body: 'Body',
} as const;

export const keysOf = <T extends Record<string, string>>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];
