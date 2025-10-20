export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'https://nyxora.ro';
  const baseUrl = base.startsWith('http') ? base : `https://${base}`;
  
  const text = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /_next/
Disallow: /build/

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(text, { 
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    } 
  });
}
