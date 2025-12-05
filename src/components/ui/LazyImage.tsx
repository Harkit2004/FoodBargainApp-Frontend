import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';
import defaultPlaceholder from '@/assets/hero-food.jpg';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName,
  fallbackSrc = defaultPlaceholder,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(!src);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const targetSrc = src || fallbackSrc;
    
    // Only reset if the source has actually changed
    if (targetSrc !== imgSrc) {
      setImgSrc(targetSrc);
      setIsFallback(!src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, fallbackSrc, imgSrc]);

  useEffect(() => {
    // Check if image is already loaded on mount or update
    if (imgRef.current && imgRef.current.complete) {
      setIsLoading(false);
    }
  }, [imgSrc]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (isFallback) {
      setIsLoading(false);
      setHasError(true);
    } else {
      setImgSrc(fallbackSrc);
      setIsFallback(true);
      setIsLoading(true);
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-gray-800", containerClassName)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse z-10">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-500 z-0">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}

      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          (isLoading || hasError) ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      />
    </div>
  );
};
