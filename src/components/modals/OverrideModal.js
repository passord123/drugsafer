import React from 'react';
import { AlertTriangle } from 'lucide-react';
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
            {safetyChecks?.hasTimeRestriction && (
              <div className="mt-2">
                <p className="text-gray-600">
                  Time since last dose: {safetyChecks.timeSinceLastDose.toFixed(1)} hours
                </p>
                <p className="text-gray-600">
                  Recommended wait time: {safetyChecks.recommendedWaitTime.toFixed(1)} hours
                </p>
              </div>
            )}
            {safetyChecks?.hasQuotaRestriction && (
              <div className="mt-2">
                <p className="text-red-600">
                  Daily dose limit ({drug.settings.maxDailyDoses} doses) reached.
                  You have taken {safetyChecks.dosesToday} doses today.
                </p>
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