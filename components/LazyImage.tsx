
import React, { useState } from 'react';
import { Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const LazyImage: React.FC<LazyImageProps> = ({ className, alt, src, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded-lg min-h-[150px] flex items-center justify-center ${className} ${!loaded ? 'animate-pulse' : ''}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
           <ImageIcon size={24} />
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-xs">
          <AlertTriangle size={24} className="mb-1" />
          <span>加载失败</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setError(true); }}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;