"use client";

import Image from 'next/image';

function isExternal(url) {
  try {
    const u = new URL(url);
    return u.protocol.startsWith('http');
  } catch (e) {
    return false;
  }
}

export default function SmartImage({ src, alt = '', width, height, className = '', style = {}, fill = false, ...rest }) {
  if (!src) return null;

  if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://')) ) {
    // external image: render plain img to avoid next/image host validation
    const imgStyle = { display: 'block', width: fill ? '100%' : width || 'auto', height: fill ? '100%' : height || 'auto', objectFit: style.objectFit || 'cover', ...style };
    // Remove Next/Image specific props that are invalid on native img
    const forbidden = ['priority', 'placeholder', 'blurDataURL', 'unoptimized', 'fetchPriority', 'sizes', 'loader', 'quality', 'layout'];
    const imgProps = { ...rest };
    for (const k of forbidden) delete imgProps[k];
    return <img src={src} alt={alt} className={className} style={imgStyle} {...imgProps} />;
  }

  // fallback to next/image for local assets
  if (fill) {
    return <Image src={src} alt={alt} fill className={className} style={style} {...rest} />;
  }

  return <Image src={src} alt={alt} width={width} height={height} className={className} style={style} {...rest} />;
}
