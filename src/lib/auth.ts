import crypto from 'node:crypto';

const SESSION_SECRET = import.meta.env.ADMIN_PASSWORD || import.meta.env.SUPABASE_ANON_KEY || 'fallback-dev-only';

export function createSessionToken(): string {
  const payload = JSON.stringify({ role: 'admin', ts: Date.now() });
  const iv = crypto.randomBytes(8).toString('hex');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload + iv).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + iv + '.' + sig;
}

export function verifySessionToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [encodedPayload, iv, sig] = parts;
    const payload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload + iv).digest('hex');
    return sig === expectedSig;
  } catch {
    return false;
  }
}
