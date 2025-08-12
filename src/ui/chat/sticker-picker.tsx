'use client';

import { useState, useEffect } from 'react';
import { api, CompanyStickerDTO } from '@/api';
import { useAuth } from '@/contexts/auth-context';

interface StickerPickerProps {
  onStickerSelect: (sticker: CompanyStickerDTO) => void;
  onClose: () => void;
}

export function StickerPicker({ onStickerSelect, onClose }: StickerPickerProps) {
  const { currentUser } = useAuth();
  const [stickers, setStickers] = useState<CompanyStickerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStickers();
  }, []);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Seleccionar Sticker</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600 text-sm">Cargando stickers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={fetchStickers} 
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : stickers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No hay stickers disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => onStickerSelect(sticker)}
                  className="aspect-square p-1 rounded-lg hover:bg-gray-100 transition-colors"
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
    </div>
  );
}
