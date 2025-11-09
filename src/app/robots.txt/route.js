export async function GET() {
  // Force canonical host to www to match site canonicals and sitemap
  const forcedHost = 'https://www.nyxora.ro';
  const baseUrl = forcedHost;

  const text = `User-agent: *
# Allow everything by default, block only admin/auth/api endpoints and private areas
Allow: /

# Disallow private or non-indexable paths
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /private/
Disallow: /r/
Disallow: /favorites
Disallow: /build
Disallow: /profile

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