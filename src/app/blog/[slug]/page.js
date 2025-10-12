import Image from 'next/image';
import connect from '../../api/lib/db';
import Blog from '../../api/lib/models/Blog';
import Product from '../../api/lib/models/Product';

const escapeHtml = (input = '') => input.replace(/[&<>"']/g, (char) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return map[char] || char;
});

export default async function BlogDetail({ params }) {
  try {
    await connect();
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) {
      return (<div className="container px-6 py-12"><h1>Articol negăsit</h1></div>);
    }
    const b = await Blog.findOne({ slug: slugParam, published: true }).lean();
    if (!b) return (<div className="container px-6 py-12"><h1>Articol negăsit</h1></div>);

    let contentHTML = b.content || '';

    // Transform blog-product-card (editor placeholder) to blog-product-render (styled display)
    if (contentHTML && contentHTML.includes('blog-product-card')) {
      contentHTML = contentHTML.replace(
        /class="blog-product-card"/g,
        'class="blog-product-render"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__inner"/g,
        'class="blog-product-render__body"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__title"/g,
        'class="blog-product-render__title"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__left"/g,
        'class="blog-product-render__left"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__main"/g,
        'class="blog-product-render__main"'
      );
      contentHTML = contentHTML.replace(/class="blog-product-card__view-btn"/g, 'class="blog-product-render__view-btn"');
      contentHTML = contentHTML.replace(
        /class="blog-product-card__price"/g,
        'class="blog-product-render__price"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__actions"/g,
        'class="blog-product-render__actions"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__link"/g,
        'class="blog-product-render__cta"'
      );
      contentHTML = contentHTML.replace(
        /class="blog-product-card__link blog-product-card__link--affiliate"/g,
        'class="blog-product-render__cta blog-product-render__cta--secondary"'
      );
    }

    if (!contentHTML) {
      contentHTML = b.excerpt || '';
    }

    return (
      <div className="container px-6 py-12">
  <h1 className="text-2xl sm:text-3xl font-semibold mb-4">{b.title}</h1>
        <div className="text-sm text-slate-400 mb-6">{b.author} • {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : ''}</div>
        {b.image && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-white/10 mb-6">
            <Image
              src={b.image}
              alt={b.title}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />
      </div>
    );
  } catch (err) {
    console.error('[page]/blog/[slug] error', err);
    return (<div className="container px-6 py-12"><h1>Eroare</h1></div>);
  }
}
