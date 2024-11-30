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
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        absolute bg-white dark:bg-gray-900 
        ${fullScreen ? 'inset-0' : 'inset-x-4 top-1/2 -translate-y-1/2 rounded-lg max-h-[85vh]'}
        flex flex-col transform opacity-100 transition-all duration-200
        shadow-xl border border-gray-200 dark:border-gray-700
        sm:max-w-lg sm:mx-auto sm:inset-x-4
        ${className}
      `}>
        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex-1 pr-4">
              {typeof title === 'string' ? (
                <h2 
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white truncate"
                >
                  {title}
                </h2>
              ) : (
                <div id="modal-title">{title}</div>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 
                         hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain bg-white dark:bg-gray-900">
          <div className="text-gray-900 dark:text-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;