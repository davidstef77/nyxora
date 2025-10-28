export async function GET() {
  // preferăm NEXT_PUBLIC_BASE_URL; dacă e absent folosim VERCEL_URL (with https) sau fallback
  const envBase = process.env.NEXT_PUBLIC_BASE_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                  'https://nyxora.ro';
  const baseUrl = envBase.endsWith('/') ? envBase.slice(0, -1) : envBase;

  const text = `User-agent: *
# Allow everything by default, block only admin/auth/api endpoints and private areas
Allow: /

# Disallow private or non-indexable paths
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /private/

# Do not disallow /_next/ or static assets — crawlers need access to CSS/JS/images
# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}