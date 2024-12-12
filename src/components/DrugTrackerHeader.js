import React from 'react';
import PropTypes from 'prop-types';
import { Clock, History, Settings, Timer, Package, Shield } from 'lucide-react';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const DrugTrackerHeader = ({
  drug,
  onOpenHistory,
  onOpenSettings,
  lastDoseTime,
  currentPhase,
  timeRemaining,
}) => {
  const getProfile = (drugName, category) => {
    return timingProfiles[drugName.toLowerCase()] || 
           categoryProfiles[category] || 
           timingProfiles.default;
  };

  const profile = getProfile(drug.name, drug.category);
  const totalMinutes = profile.total();
  const recommendedHours = totalMinutes / 60;

  const calculateTimeToNextDose = () => {
    if (!lastDoseTime) return { safe: true, timeLeft: 0 };
    
    const now = new Date();
    const lastDose = new Date(lastDoseTime);
    const timeSinceLastDose = (now - lastDose) / (1000 * 60 * 60);
    const timeLeft = recommendedHours - timeSinceLastDose;
    
    return {
      safe: timeLeft <= 0,
      timeLeft: Math.max(0, timeLeft)
    };
  };

  const formatDuration = (hours) => {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    if (fullHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${fullHours}h`;
    return `${fullHours}h ${minutes}m`;
  };

  const formatLastDoseTime = (timestamp) => {
    if (!timestamp) return 'No doses recorded';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 24) {
      if (diffHours === 0) {
        return diffMinutes === 0 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    
    if (diffHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextDoseInfo = calculateTimeToNextDose();

  return (
    <div className="space-y-6">
      {/* Drug Name and Basic Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {drug.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {drug.category} • Standard dose: {drug.settings?.defaultDosage || drug.dosage} 
            {drug.settings?.defaultDosageUnit || drug.dosageUnit}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onOpenHistory}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                   bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 
                   text-white rounded-lg transition-colors"
        >
          <History className="w-5 h-5" />
          <span className="font-medium">View Dose History</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center gap-2 px-4 py-3 
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Last Dose Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Last Dose</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {formatLastDoseTime(lastDoseTime)}
            </p>
            {lastDoseTime && drug.doses?.[0] && (
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {drug.doses[0].dosage} {drug.settings?.defaultDosageUnit || drug.dosageUnit}
              </p>
            )}
          </div>
        </div>

        {/* Next Dose Timer */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4
                      ${!nextDoseInfo.safe 
                        ? 'border-red-200 dark:border-red-800' 
                        : 'border-gray-200 dark:border-gray-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Next Dose</h3>
          </div>
          <div className="space-y-1">
            {!nextDoseInfo.safe ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Wait {formatDuration(nextDoseInfo.timeLeft)}
              </p>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400">
                Available now
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Min {formatDuration(recommendedHours)} between doses
            </p>
          </div>
        </div>
      </div>

      {/* Supply Warning */}
      {drug.settings?.trackSupply && drug.settings.currentSupply <= 5 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 
                     border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <Package className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Low supply warning: {drug.settings.currentSupply} 
            {drug.settings?.defaultDosageUnit || drug.dosageUnit} remaining
          </p>
        </div>
      )}
    </div>
  );
};

DrugTrackerHeader.propTypes = {
  drug: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    dosage: PropTypes.number,
    dosageUnit: PropTypes.string,
    doses: PropTypes.array,
    settings: PropTypes.shape({
      defaultDosage: PropTypes.number,
      defaultDosageUnit: PropTypes.string,
      trackSupply: PropTypes.bool,
      currentSupply: PropTypes.number
    })
  }).isRequired,
  onOpenHistory: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  lastDoseTime: PropTypes.string,
  currentPhase: PropTypes.string,
  timeRemaining: PropTypes.shape({
    hours: PropTypes.number,
    minutes: PropTypes.number
  })
};

export default DrugTrackerHeader;