'use client';

interface FileAttachmentProps {
  fileName: string;
  fileSize?: string;
  fileUrl: string;
  fileType?: string;
  className?: string;
}

export function FileAttachment({ fileName, fileSize, fileUrl, fileType, className = '' }: FileAttachmentProps) {
  const getFileIcon = (type?: string, name?: string) => {
    const extension = name?.split('.').pop()?.toLowerCase() || '';
    
    if (type?.includes('pdf') || extension === 'pdf') {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M11.5 13.5c0 .3-.1.5-.3.7-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.2-.2-.3-.4-.3-.7s.1-.5.3-.7c.2-.2.4-.3.7-.3s.5.1.7.3c.2.2.3.4.3.7z"/>
          </svg>
        </div>
      );
    }
    
    if (type?.includes('word') || ['doc', 'docx'].includes(extension)) {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M10.5 17l-1-4h-1l-1 4H6l2-6h2l2 6h-1.5z"/>
          </svg>
        </div>
      );
    }
    
    if (type?.includes('excel') || ['xls', 'xlsx'].includes(extension)) {
      return (
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M8.5 17l1.5-2.5L11.5 17H13l-2.5-3.5L13 10h-1.5L10 12.5 8.5 10H7l2.5 3.5L7 17h1.5z"/>
          </svg>
        </div>
      );
    }
    
    if (type?.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) {
      return (
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M9 10v6h1v-2h1.5a1.5 1.5 0 0 0 0-3H9zm1 1h1.5a.5.5 0 0 1 0 1H10v-1z"/>
          </svg>
        </div>
      );
    }
    
    if (type?.includes('text') || ['txt'].includes(extension)) {
      return (
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M9 13h6"/>
            <path d="M9 17h6"/>
            <path d="M9 9h1"/>
          </svg>
        </div>
      );
    }
    
    if (type?.includes('zip') || type?.includes('rar') || ['zip', 'rar', '7z'].includes(extension)) {
      return (
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M10 12h1v1h-1v-1zm1-1h1v1h-1v-1zm-1-1h1v1h-1V9zm1-1h1v1h-1V8z"/>
          </svg>
        </div>
      );
    }
    
    // Default file icon
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <path d="M14 2v6h6"/>
        </svg>
      </div>
    );
  };

  const formatFileSize = (sizeStr?: string) => {
    if (!sizeStr) return '';
    
    // Si ya viene formateado, devolverlo
    if (sizeStr.includes('KB') || sizeStr.includes('MB') || sizeStr.includes('GB')) {
      return sizeStr;
    }
    
    // Si es un número, convertirlo
    const bytes = parseInt(sizeStr);
    if (isNaN(bytes)) return '';
    
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer max-w-sm ${className}`}
         onClick={handleDownload}>
      
      {/* File Icon */}
      {getFileIcon(fileType, fileName)}
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate text-sm">
          {fileName}
        </div>
        {fileSize && (
          <div className="text-xs text-gray-500">
            {formatFileSize(fileSize)}
          </div>
        )}
      </div>
      
      {/* Download Icon */}
      <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
  );
}
