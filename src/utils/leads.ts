// Shared between the lead forms (LeadForm.astro) and the endpoint (pages/api/lead.ts).

export const LEAD_TYPES = {
  quote: 'Yêu cầu báo giá sỉ',
  wholesale: 'Đăng ký mua sỉ',
  agent: 'Đăng ký làm đại lý',
  sample: 'Yêu cầu gửi mẫu thử',
  retail: 'Khách lẻ',
} as const;

export type LeadType = keyof typeof LEAD_TYPES;

export const LEAD_NEEDS = ['Cà phê nhân xanh', 'Cà phê rang xay', 'Cà phê quà tặng', 'Khác'] as const;

// Public by design (it ships in the page HTML). The matching secret is the TURNSTILE_SECRET_KEY Worker secret.
// `astro dev` uses Cloudflare's always-pass test key, which pairs with the test secret in .dev.vars.
export const TURNSTILE_SITE_KEY = import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAAFNec3r9WyCEekZj';
