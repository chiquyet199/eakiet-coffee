// Verifies the Cloudflare Access JWT that Access adds to requests it has authenticated.
// Fails closed: if ACCESS_TEAM_DOMAIN / ACCESS_AUD are not configured, nobody gets in.
// https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/

type Jwk = JsonWebKey & { kid: string };

function base64UrlDecode(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/** Returns the authenticated user's email, or null if the request is not authorised. */
export async function getAccessUser(request: Request, env: Env): Promise<string | null> {
  const teamDomain = env.ACCESS_TEAM_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const aud = env.ACCESS_AUD;
  if (!teamDomain || !aud) return null;

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  try {
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64))) as { kid?: string; alg?: string };
    if (header.alg !== 'RS256') return null;

    const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
    const { keys } = (await res.json()) as { keys: Jwk[] };
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;

    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      base64UrlDecode(signatureB64),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as {
      aud?: string | string[];
      iss?: string;
      exp?: number;
      email?: string;
    };
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(aud)) return null;
    if (payload.iss !== `https://${teamDomain}`) return null;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload.email ?? 'unknown';
  } catch {
    return null;
  }
}
