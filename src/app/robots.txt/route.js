export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const baseUrl = base.startsWith('http') ? base : `https://${base}`;
  const text = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain' } });
}
