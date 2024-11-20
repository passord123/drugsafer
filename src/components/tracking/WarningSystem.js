import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const Alert = ({ children, variant }) => {
  const colors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[variant]}`}>
      {children}
    </div>
  );
};

const WarningSystem = ({ medication, lastDose, dailyDoses }) => {
  const generateWarnings = () => {
    const warnings = [];
    const now = new Date();
    const lastDoseTime = lastDose ? new Date(lastDose.timestamp) : null;

    if (lastDoseTime) {
      const hoursSinceLastDose = (now - lastDoseTime) / (1000 * 60 * 60);
      if (hoursSinceLastDose > medication.settings.minTimeBetweenDoses * 2) {
        warnings.push({
          type: 'missed',
          severity: 'high',
          message: 'You missed your last scheduled dose'
        });
      }
    }

    if (dailyDoses >= medication.settings.maxDailyDoses) {
      warnings.push({
        type: 'limit',
        severity: 'high',
        message: 'Daily dose limit reached'
      });
    }

    if (medication.warnings) {
      warnings.push({
        type: 'info',
        severity: 'medium',
        message: medication.warnings
      });
    }

    return warnings;
  };

  const warnings = generateWarnings();

  return (
    <div className="space-y-3">
      {warnings.map((warning, index) => (
        <Alert 
          key={index}
          variant={warning.severity}
        >
          <div className="flex items-start space-x-3">
            {warning.severity === 'high' ? (
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            )}
            <span className={`${
              warning.severity === 'high' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {warning.message}
            </span>
          </div>
        </Alert>
      ))}
      {warnings.length === 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500">
          No active warnings
        </div>
      )}
    </div>
  );
};

export default WarningSystem;