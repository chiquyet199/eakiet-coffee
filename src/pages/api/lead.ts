import type { APIRoute } from 'astro';
import { LEAD_NOTIFY_EMAIL } from '../../utils/constants';
import { LEAD_TYPES, type LeadType } from '../../utils/leads';

export const prerender = false;

const LIMITS = { name: 100, phone: 20, email: 120, need: 60, quantity: 60, product: 120, message: 2000, page: 200 };
type Field = keyof typeof LIMITS;

class LeadError extends Error {}

function field(form: FormData, key: Field): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim().slice(0, LIMITS[key]) : '';
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

function base64Utf8(text: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function sendNotification(env: Env, lead: Record<string, string>, origin: string) {
  const from = env.LEAD_EMAIL_FROM;
  const to = LEAD_NOTIFY_EMAIL;
  if (!env.LEAD_EMAIL || !from) return;
  const { EmailMessage } = await import('cloudflare:email');
  const typeLabel = LEAD_TYPES[lead.type as LeadType];
  const subject = `[Website] ${typeLabel} — ${lead.name} (${lead.phone})`;
  const lines = [
    `Loại yêu cầu: ${typeLabel}`,
    `Họ tên: ${lead.name}`,
    `Số điện thoại: ${lead.phone}`,
    lead.email && `Email: ${lead.email}`,
    lead.need && `Nhu cầu: ${lead.need}`,
    lead.quantity && `Số lượng dự kiến: ${lead.quantity}`,
    lead.product && `Sản phẩm: ${lead.product}`,
    lead.message && `\nNội dung:\n${lead.message}`,
    `\nGửi từ trang: ${lead.page || '(không rõ)'}`,
    `Xem tất cả yêu cầu: ${origin}/admin/leads`,
  ].filter(Boolean);
  const domain = from.split('@')[1] ?? 'localhost';
  const raw = [
    `From: =?UTF-8?B?${base64Utf8('Website HTX Công Bằng Ea Kiết')}?= <${from}>`,
    `To: ${to}`,
    // Replying to the notification goes straight to the customer when they left an email.
    ...(lead.email ? [`Reply-To: ${lead.email}`] : []),
    `Subject: =?UTF-8?B?${base64Utf8(subject)}?=`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Utf8(lines.join('\n')).replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n');
  await env.LEAD_EMAIL.send(new EmailMessage(from, to, raw));
}

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const respond = (ok: boolean, error?: string, status = ok ? 200 : 400) =>
    wantsJson
      ? Response.json({ ok, error }, { status })
      : redirect(ok ? '/cam-on' : `/contact?error=${encodeURIComponent(error ?? '')}#lien-he`, 303);

  const env = locals.runtime.env;

  try {
    const form = await request.formData();

    // Honeypot: real visitors never see or fill this field.
    if (form.get('website')) return respond(true);

    const type = String(form.get('type') ?? '');
    if (!(type in LEAD_TYPES)) throw new LeadError('Vui lòng chọn loại yêu cầu.');

    const lead = {
      type,
      name: field(form, 'name'),
      phone: field(form, 'phone'),
      email: field(form, 'email'),
      need: field(form, 'need'),
      quantity: field(form, 'quantity'),
      product: field(form, 'product'),
      message: field(form, 'message'),
      page: field(form, 'page'),
    };
    if (!lead.name) throw new LeadError('Vui lòng nhập họ tên.');
    if (!/^[0-9+\s().-]{8,20}$/.test(lead.phone)) throw new LeadError('Số điện thoại không hợp lệ.');
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new LeadError('Email không hợp lệ.');

    if (!env.TURNSTILE_SECRET_KEY) {
      console.error('TURNSTILE_SECRET_KEY is not set');
      return respond(false, 'Hệ thống tạm thời gián đoạn. Vui lòng gọi hotline hoặc nhắn Zalo.', 500);
    }
    const ip = request.headers.get('CF-Connecting-IP');
    const token = String(form.get('cf-turnstile-response') ?? '');
    if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip))) {
      throw new LeadError('Xác minh chống spam không thành công. Vui lòng thử lại.');
    }

    await env.LEADS_DB.prepare(
      'INSERT INTO leads (type, name, phone, email, need, quantity, product, message, page, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(lead.type, lead.name, lead.phone, lead.email || null, lead.need || null, lead.quantity || null,
        lead.product || null, lead.message || null, lead.page || null, ip)
      .run();

    // The lead is already stored, so a mail failure must not fail the request.
    try {
      await sendNotification(env, lead, new URL(request.url).origin);
    } catch (err) {
      console.error('Lead email notification failed', err);
    }

    return respond(true);
  } catch (err) {
    if (err instanceof LeadError) return respond(false, err.message);
    console.error('Lead submission failed', err);
    return respond(false, 'Không gửi được yêu cầu. Vui lòng gọi hotline hoặc nhắn Zalo.', 500);
  }
};
