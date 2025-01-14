import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Info, Check, X } from 'lucide-react';

const AlertContext = createContext(null);

// Constants
const MAX_ALERTS = 3;
const ALERT_DURATION = 5000; // 5 seconds

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Define removeAlert first
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Then define addAlert using removeAlert
  const addAlert = useCallback((message, type = 'info') => {
    const id = Date.now();
    
    // Add the new alert
    setAlerts(prev => [...prev.slice(-MAX_ALERTS + 1), { 
      id, 
      type, 
      message 
    }]);
    
    // Set up auto-removal
    if (type !== 'error') { // Don't auto-remove error alerts
      setTimeout(() => {
        removeAlert(id);
      }, ALERT_DURATION);
    }

    return id;
  }, [removeAlert]); // Include removeAlert in dependencies

  // Specialized alert functions
  const addDoseWarning = useCallback((message) => {
    addAlert(message, 'warning');
  }, [addAlert]);

  const addSafetyAlert = useCallback((message) => {
    addAlert(message, 'error');
  }, [addAlert]);

  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return AlertTriangle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return Check;
      default:
        return Info;
    }
  };

  return (
    <AlertContext.Provider value={{ 
      addAlert,
      addDoseWarning,
      addSafetyAlert,
      removeAlert
    }}>
      {children}
      <div className="fixed top-0 right-0 p-4 z-50 space-y-2 pointer-events-none">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`max-w-sm w-full pointer-events-auto flex items-center p-4 rounded-lg border shadow-lg
              transform transition-all duration-300 ${getAlertStyles(alert.type)}`}
          >
            <div className="flex-shrink-0">
              {React.createElement(getAlertIcon(alert.type), {
                className: 'w-5 h-5'
              })}
            </div>
            <p className="ml-3 mr-8 flex-1">{alert.message}</p>
            <button
              onClick={() => removeAlert(alert.id)}
              className="flex-shrink-0 ml-auto p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export default AlertProvider;