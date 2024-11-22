import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm rounded-lg overflow-hidden shadow-xl 
                   max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 
                   transition-all duration-200 m-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t px-4 py-3 sm:px-6 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg 
                     hover:bg-red-600 transition-colors duration-200"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg 
                     hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;