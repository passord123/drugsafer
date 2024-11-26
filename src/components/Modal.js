import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullScreen = false,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        absolute bg-white 
        ${fullScreen ? 'inset-0' : 'inset-x-4 top-1/2 -translate-y-1/2 rounded-lg max-h-[85vh]'}
        flex flex-col
        sm:max-w-lg sm:mx-auto sm:inset-x-4
        ${className}
      `}>
        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;