'use client';

import { useState } from 'react';
import { api } from '@/api';
import { useAuth } from '@/contexts/auth-context';

interface StickerContextMenuProps {
  show: boolean;
  x: number;
  y: number;
  stickerUrl: string;
  onClose: () => void;
  onStickerSaved?: () => void;
}

export function StickerContextMenu({ 
  show, 
  x, 
  y, 
  stickerUrl, 
  onClose, 
  onStickerSaved 
}: StickerContextMenuProps) {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSaveSticker = async () => {
    if (!currentUser?.company_id || saving) return;

    try {
      setSaving(true);
      
      // Generar un nombre único para el sticker
      const timestamp = Date.now();
      const stickerName = `sticker_${timestamp}`;
      
      await api.stickers.saveSticker(stickerUrl, stickerName, currentUser.company_id);
      
      onClose();
      onStickerSaved?.();
      
      // Disparar evento personalizado para refrescar el StickerPicker
      window.dispatchEvent(new CustomEvent('stickerSaved'));
      
      // Mostrar mensaje de éxito
      alert('¡Sticker guardado exitosamente!');
      
    } catch (error) {
      console.error('Error guardando sticker:', error);
      alert('Error al guardar el sticker');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay para cerrar el menú */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menú contextual */}
      <div
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
        style={{
          left: x,
          top: y,
        }}
      >
        <button
          onClick={handleSaveSticker}
          disabled={saving}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Guardar sticker</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
