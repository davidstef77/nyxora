"use client";

import { useState, memo } from 'react';
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

function SmartImage({ 
  src, 
  alt = '', 
  width, 
  height, 
  className = '', 
  style = {}, 
  fill = false, 
  priority = false,
  loading,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  ...rest 
}) {
  const [errored, setErrored] = useState(false);
  const normalized = normalizeSrc(src);
  const sizesForFill = rest?.sizes || '100vw';

  // Dacă nu este specificat loading și avem priority, folosește 'eager'
  const effectiveLoading = loading || (priority ? 'eager' : 'lazy');

  // simple placeholder when no src provided or when load error occurred
  const placeholderSrc = '/placeholder-product.svg';
  
  if (!normalized || errored) {
    if (fill) {
      return (
        <Image 
          src={placeholderSrc} 
          alt={alt || 'Imagine indisponibilă'} 
          fill 
          className={className} 
          style={style}
          sizes={sizesForFill}
          loading="lazy"
          quality={50}
        />
      );
    }
    return (
      <Image 
        src={placeholderSrc} 
        alt={alt || 'Imagine indisponibilă'} 
        width={width || 300} 
        height={height || 200} 
        className={className} 
        style={style}
        loading="lazy"
        quality={50}
      />
    );
  }

  // external image: use next/image with unoptimized for external sources
  if (isExternalUrl(normalized)) {
    if (fill) {
      return (
        <Image 
          src={normalized} 
          alt={alt} 
          fill 
          className={className} 
          style={{ objectFit: 'cover', ...style }}
          onError={() => setErrored(true)}
          unoptimized={true}
          loading={effectiveLoading}
          priority={priority}
          sizes={sizesForFill}
          quality={quality}
          {...rest}
        />
      );
    }

    return (
      <Image 
        src={normalized} 
        alt={alt} 
        width={width || 300} 
        height={height || 200} 
        className={className} 
        style={{ objectFit: 'cover', ...style }}
        onError={() => setErrored(true)}
        unoptimized={true}
        loading={effectiveLoading}
        priority={priority}
        quality={quality}
        {...rest}
      />
    );
  }

  // local asset - use next/image for performance with optimization
  if (fill) {
    return (
      <Image 
        src={normalized} 
        alt={alt} 
        fill 
        className={className} 
        style={{ objectFit: 'cover', ...style }}
        onError={() => setErrored(true)}
        loading={effectiveLoading}
        priority={priority}
        sizes={sizesForFill}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        {...rest}
      />
    );
  }

  return (
    <Image 
      src={normalized} 
      alt={alt} 
      width={width || 300} 
      height={height || 200} 
      className={className} 
      style={{ objectFit: 'cover', ...style }}
      onError={() => setErrored(true)}
      loading={effectiveLoading}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      {...rest}
    />
  );
}

export default memo(SmartImage);
