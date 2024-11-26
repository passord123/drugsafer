import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import MobileModal from '../layout/MobileModal';

const OverrideModal = ({
  isOpen,
  onClose,
  drug,
  safetyChecks,
  overrideReason,
  onReasonChange,
  onOverride
}) => {
  const timeSinceLastDose = safetyChecks?.timeSinceLastDose ?? 0;
  const recommendedWaitTime = drug?.settings?.minTimeBetweenDoses ?? 4;
  const maxDailyDoses = safetyChecks?.maxDailyDoses ?? 0;
  const dosesToday = safetyChecks?.dosesToday ?? 0;

  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title="Safety Override Required"
      fullScreen
    >
      <div className="p-4 space-y-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Safety Warning</h3>
            <p className="mt-2 text-gray-600">
              Taking doses too close together can be dangerous. Please confirm you understand the risks.
            </p>
            
            {safetyChecks?.quotaExceeded ? (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-red-700">
                  Daily dose limit ({maxDailyDoses} doses) reached.
                  You have taken {dosesToday} doses today.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    Time since last dose: {timeSinceLastDose.toFixed(1)} hours
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    Recommended wait: {recommendedWaitTime} hours
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <textarea
          value={overrideReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Please provide a reason for this override (required)"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
          rows={3}
          required
        />

        <div className="flex gap-3">
          <button
            onClick={onOverride}
            disabled={!overrideReason.trim()}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg 
                     hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Override Safety Check
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </MobileModal>
  );
};

export default OverrideModal;