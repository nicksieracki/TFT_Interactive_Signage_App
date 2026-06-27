import React from 'react';

interface BlurredBackdropProps {
  src: string;
  alt?: string;
  type: 'image' | 'video';
  videoRef?: React.RefObject<HTMLVideoElement>;
  poster?: string;
  onVideoEnded?: () => void;
  onError?: () => void;
}

/**
 * Blurred-backdrop contain media component
 * Renders media with object-fit: contain in foreground
 * and the same media blurred with object-fit: cover as backdrop
 */
export const BlurredBackdrop: React.FC<BlurredBackdropProps> = ({
  src,
  alt = '',
  type,
  videoRef,
  poster,
  onVideoEnded,
  onError,
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Blurred backdrop */}
      {type === 'image' ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-50"
          aria-hidden="true"
        />
      ) : (
        <video
          src={src}
          poster={poster}
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-50"
          aria-hidden="true"
        />
      )}

      {/* Foreground media (contained) */}
      {type === 'image' ? (
        <img
          src={src}
          alt={alt}
          className="relative z-10 h-full w-full object-contain"
          onError={onError}
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          autoPlay
          playsInline
          className="relative z-10 h-full w-full object-contain"
          onEnded={onVideoEnded}
          onError={onError}
        />
      )}
    </div>
  );
};
