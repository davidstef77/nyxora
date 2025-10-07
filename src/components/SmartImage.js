"use client";

import { useState } from 'react';
import Image from 'next/image';

function isExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('//')) return true; // protocol-relative
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function normalizeSrc(src) {
  if (!src) return '';
  if (typeof src !== 'string') return String(src);
  // protocol-relative -> assume https
  if (src.startsWith('//')) return `https:${src}`;
  // local public paths should start with /
  if (!src.startsWith('http') && !src.startsWith('/')) return `/${src}`;
  return src;
}

export default function SmartImage({ src, alt = '', width, height, className = '', style = {}, fill = false, ...rest }) {
  const [errored, setErrored] = useState(false);
  const normalized = normalizeSrc(src);

  // simple placeholder when no src provided or when load error occurred
  const placeholder = '/placeholder-product.svg';
  if (!normalized || errored) {
    const ph = placeholder;
    if (fill) {
      return <Image src={ph} alt={alt || 'Imagine indisponibilă'} fill className={className} style={style} />;
    }
    return <Image src={ph} alt={alt || 'Imagine indisponibilă'} width={width || 600} height={height || 400} className={className} style={style} />;
  }

  // external image: render plain img to avoid next/image host validation and allow cross-host sources
  if (isExternalUrl(normalized)) {
    const imgStyle = { display: 'block', width: fill ? '100%' : width || 'auto', height: fill ? '100%' : height || 'auto', objectFit: style.objectFit || 'cover', ...style };
    const forbidden = ['priority', 'placeholder', 'blurDataURL', 'unoptimized', 'fetchPriority', 'sizes', 'loader', 'quality', 'layout'];
    const imgProps = { ...rest };
    for (const k of forbidden) delete imgProps[k];
    return <img src={normalized} alt={alt} className={className} style={imgStyle} onError={() => setErrored(true)} {...imgProps} />;
  }

  // local asset - use next/image for performance
  if (fill) {
    return <Image src={normalized} alt={alt} fill className={className} style={style} onError={() => setErrored(true)} {...rest} />;
  }

  return <Image src={normalized} alt={alt} width={width} height={height} className={className} style={style} onError={() => setErrored(true)} {...rest} />;
}
