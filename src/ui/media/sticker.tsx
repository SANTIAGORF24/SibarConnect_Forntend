'use client';

interface StickerComponentProps {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export function StickerComponent({ src, alt = 'Sticker', className = '', onClick }: StickerComponentProps) {
  return (
    <div className={`inline-block ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-24 h-24 object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 drop-shadow-sm"
        onClick={onClick}
        style={{ 
          maxWidth: '96px', 
          maxHeight: '96px',
          imageRendering: 'auto',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
        }}
      />
    </div>
  );
}
