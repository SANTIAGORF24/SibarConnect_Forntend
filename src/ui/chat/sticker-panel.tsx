'use client';

import { useState, useEffect } from 'react';
import { api, CompanyStickerDTO } from '@/api';
import { useAuth } from '@/contexts/auth-context';

interface StickerPanelProps {
  isOpen: boolean;
  onStickerSelect: (sticker: CompanyStickerDTO) => void;
  onClose: () => void;
}

export function StickerPanel({ isOpen, onStickerSelect, onClose }: StickerPanelProps) {
  const { currentUser } = useAuth();
  const [stickers, setStickers] = useState<CompanyStickerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStickers();
    }
  }, [isOpen]);

  useEffect(() => {
    // Escuchar evento personalizado para refrescar stickers
    const handleStickerSaved = () => {
      if (isOpen) {
        fetchStickers();
      }
    };
    
    window.addEventListener('stickerSaved', handleStickerSaved);
    
    return () => {
      window.removeEventListener('stickerSaved', handleStickerSaved);
    };
  }, [isOpen]);

  const fetchStickers = async () => {
    if (!currentUser?.company_id) return;

    try {
      setLoading(true);
      const stickersData = await api.stickers.getCompanyStickers(currentUser.company_id);
      setStickers(stickersData);
    } catch (err) {
      console.error('Error fetching stickers:', err);
      setError('Error al cargar stickers');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">Stickers</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-600 text-sm">Cargando stickers...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <button 
              onClick={fetchStickers} 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : stickers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-1">No hay stickers disponibles</p>
            <p className="text-gray-400 text-xs">Haz clic derecho en un sticker del chat para guardarlo</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onStickerSelect(sticker)}
                className="aspect-square p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title={sticker.name}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-full h-full object-contain rounded"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
