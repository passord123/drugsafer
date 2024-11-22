// src/components/DrugTimer/Alert.js
import React, { useEffect } from 'react';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';

export const Alert = ({ 
  message, 
  type = 'info',  // 'info', 'warning', or 'error'
  onDismiss, 
  autoDismiss = true,
  autoDismissTime = 5000 
}) => {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissTime);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissTime, onDismiss]);

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <div className={`relative flex items-center p-4 rounded-lg border ${styles[type]}`}>
      {type === 'error' ? (
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <p className="ml-3 mr-8">{message}</p>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute right-2 top-2 p-1 hover:bg-black/5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Additional alert types
export const DoseWarningAlert = ({ message, onDismiss }) => (
  <Alert
    type="warning"
    message={message}
    onDismiss={onDismiss}
  />
);

export const SafetyAlert = ({ message, onDismiss }) => (
  <Alert
    type="error"
    message={message}
    onDismiss={onDismiss}
    autoDismiss={false}
  />
);

export const TimingAlert = ({ message, onDismiss }) => (
  <Alert
    type="info"
    message={message}
    onDismiss={onDismiss}
  />
);

// Default export for backward compatibility
export default Alert;