import React, { useRef, useEffect } from 'react';

interface IframeWrapperProps {
  src: string;
  title: string;
  className?: string;
}

/**
 * IframeWrapper component that helps detect user interactions with iframed content
 * for the idle timer. Since we can't detect events inside cross-origin iframes,
 * we detect when the iframe gains/loses focus.
 */
export const IframeWrapper: React.FC<IframeWrapperProps> = ({ src, title, className = 'h-full w-full' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // When iframe gains focus, user clicked into it - reset idle timer
    const handleFocus = () => {
      console.log('[IframeWrapper] Iframe focused - user interacting');
      // Trigger an event that the idle timer listens to
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };

    // When iframe loses focus (user clicks outside), also reset timer
    const handleBlur = () => {
      console.log('[IframeWrapper] Iframe blurred - user was interacting');
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };

    iframe.addEventListener('focus', handleFocus);
    iframe.addEventListener('blur', handleBlur);

    return () => {
      iframe.removeEventListener('focus', handleFocus);
      iframe.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      className={`${className} border-0`}
      // Allow iframe to receive focus
      tabIndex={0}
    />
  );
};