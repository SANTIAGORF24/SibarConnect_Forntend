'use client';

import { useState } from 'react';

interface FilePreviewModalProps {
  file: File | null;
  fileType: 'image' | 'video' | 'audio' | 'document';
  onSend: (caption?: string) => Promise<void>;
  onCancel: () => void;
}

export function FilePreviewModal({ file, fileType, onSend, onCancel }: FilePreviewModalProps) {
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);

  if (!file) return null;

  const handleSend = async () => {
    setSending(true);
    await onSend(caption.trim() || undefined);
    setSending(false);
  };

  const getFilePreview = () => {
    const fileUrl = URL.createObjectURL(file);

    switch (fileType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={fileUrl} 
              alt="Preview" 
              className="max-w-full max-h-96 rounded-lg object-contain"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="flex justify-center">
            <video 
              src={fileUrl} 
              controls 
              className="max-w-full max-h-96 rounded-lg"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex justify-center items-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Archivo de audio</p>
              <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
              <audio src={fileUrl} controls className="mt-4" />
            </div>
          </div>
        );
      
      case 'document':
      default:
        return (
          <div className="flex justify-center items-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">{file.name}</p>
              <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
            </div>
          </div>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Enviar {fileType === 'image' ? 'imagen' : fileType === 'video' ? 'video' : fileType === 'audio' ? 'audio' : 'documento'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-4">
          {getFilePreview()}
        </div>

        {/* Caption and controls */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Agrega un comentario..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              maxLength={1000}
            />
          </div>
          
          <div className="flex items-end space-x-3">
            <button
              onClick={onCancel}
              disabled={sending}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span>{sending ? 'Enviando...' : 'Enviar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}