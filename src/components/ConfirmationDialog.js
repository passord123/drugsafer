import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  confirmButtonClassName = "",
  cancelButtonClassName = ""
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore scrolling when modal closes
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get button styles based on type
  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white';
      case 'success':
        return 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white';
      default:
        return 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white';
    }
  };

  // Get icon color based on type
  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'success':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-lg overflow-hidden shadow-xl 
                   border border-gray-200 dark:border-gray-700 transform scale-100 opacity-100 
                   transition-all duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Dialog Header & Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <AlertTriangle className={`w-6 h-6 ${getIconColor()} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${getConfirmButtonStyles()} ${confirmButtonClassName}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors
                     bg-gray-100 dark:bg-gray-700 
                     hover:bg-gray-200 dark:hover:bg-gray-600
                     text-gray-700 dark:text-gray-300 ${cancelButtonClassName}`}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;