import 'server-only';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'campuscred-assets';

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

/**
 * Upload an object using Supabase Storage's REST API. This uses the service-role
 * key only on the server; never expose that key in a NEXT_PUBLIC_ variable.
 * The configured bucket should be public for profile photos and certificates.
 */
export async function uploadSupabaseObject(
  objectPath: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const baseUrl = SUPABASE_URL.replace(/\/+$/, '');
  const uploadUrl = `${baseUrl}/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodedPath}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: Buffer.from(data),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Unknown storage error');
    throw new Error(`Supabase Storage upload failed (${response.status}): ${message.slice(0, 400)}`);
  }

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${encodedPath}`;
}
