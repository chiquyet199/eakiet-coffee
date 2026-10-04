import { z } from 'astro/zod';
import siteJson from '../data/site.json';

export const SITE_TITLE = 'HTX Công Bằng Ea Kiết';
export const SITE_LEGAL_NAME = 'Hợp tác xã Nông nghiệp – Dịch vụ Công Bằng Ea Kiết';
export const SITE_DESCRIPTION =
  'Hợp tác xã Nông nghiệp – Dịch vụ Công Bằng Ea Kiết — cà phê nhân xanh, cà phê rang xay và quà tặng từ vùng đất bazan Tây Nguyên.';

// Contact, legal and social details all come from src/data/site.json (editable in the CMS under
// "Cài đặt → Thông tin liên hệ & pháp lý"). Validated here so a bad edit fails the build, not the page.
const site = z
  .object({
    phone: z.string().refine((p) => p.replace(/\D/g, '').length >= 8, 'phone must contain at least 8 digits'),
    zalo: z.string().optional(),
    email: z.string().email(),
    notifyEmail: z.union([z.string().email(), z.literal('')]).optional(),
    hours: z.string(),
    taxCode: z.string(),
    representative: z.string(),
    office: z.string(),
    factory: z.string(),
    mapQuery: z.string(),
    facebook: z.string().url(),
    instagram: z.string().url(),
  })
  .parse(siteJson);

/** Vietnamese local number ("0909 620 992") → international digits ("84909620992"). */
function toIntl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `84${digits.slice(1)}` : digits;
}

export const CONTACT = {
  phone: site.phone,
  tel: `tel:+${toIntl(site.phone)}`,
  email: site.email,
  hours: site.hours,
} as const;

export const LEGAL = {
  taxCode: site.taxCode,
  representative: site.representative,
  office: site.office,
  factory: site.factory,
  mapQuery: site.mapQuery,
} as const;

// Zalo opens a chat with a personal account via zalo.me/<country code + number, no leading 0>.
export const ZALO_URL = `https://zalo.me/${toIntl(site.zalo || site.phone)}`;

/** Recipient of new-enquiry emails (must be a verified destination in Cloudflare Email Routing). */
export const LEAD_NOTIFY_EMAIL = site.notifyEmail || site.email;

// Placeholder hero video (Mixkit free stock, roasted beans) — swap for the HTX's own harvest/drying footage.
export const HERO_VIDEO_URL = 'https://assets.mixkit.co/videos/4982/4982-720.mp4';

export const SOCIAL = {
  facebook: site.facebook,
  instagram: site.instagram,
} as const;
