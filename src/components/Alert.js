// src/components/Alert.js
import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export const Alert = ({
  message,
  type = 'info',
  onDismiss,
  title,
  icon: CustomIcon,
  action,
  duration = 5000,
  className = ''
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertTriangle
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle
    }
  };

  const style = styles[type];
  const Icon = CustomIcon || style.icon;

  return (
    <div className={`relative flex items-start p-4 rounded-lg border ${style.bg} ${style.border} ${className}`}>
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${style.text}`} />
      </div>
      <div className="ml-3 flex-1">
        {title && (
          <h3 className={`text-sm font-medium ${style.text}`}>
            {title}
          </h3>
        )}
        <div className={`text-sm ${style.text}`}>
          {message}
        </div>
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`ml-4 inline-flex flex-shrink-0 ${style.text} hover:opacity-75`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Safety alert specific component
export const SafetyAlert = ({ message, onDismiss }) => (
  <Alert
    type="error"
    message={message}
    onDismiss={onDismiss}
    title="Safety Warning"
    icon={AlertTriangle}
    duration={0} // Safety alerts don't auto-dismiss
  />
);

// Dose warning specific component
export const DoseWarning = ({ message, onDismiss }) => (
  <Alert
    type="warning"
    message={message}
    onDismiss={onDismiss}
    title="Dose Warning"
    duration={8000}
  />
);

// Supply warning specific component
export const SupplyWarning = ({ amount, unit, onDismiss }) => (
  <Alert
    type="warning"
    message={`Low supply warning: ${amount} ${unit} remaining`}
    onDismiss={onDismiss}
    title="Supply Warning"
  />
);

// Interaction warning specific component
export const InteractionWarning = ({ drug1, drug2, severity, onDismiss }) => (
  <Alert
    type={severity === 'high' ? 'error' : 'warning'}
    message={`Potential ${severity} risk interaction between ${drug1} and ${drug2}`}
    onDismiss={onDismiss}
    title="Drug Interaction Warning"
    duration={0}
  />
);

export default Alert;