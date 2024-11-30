import React, { useState } from 'react';
import { 
  Clock, 
  Settings,
  AlertTriangle, 
  Package,
  Timer,
  Activity,
  HeartPulse,
  Shield,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  History,
  Info
} from 'lucide-react';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const MobileDrugTracker = ({
  drug,
  lastDoseTime,
  currentPhase,
  timeToNextPhase,
  onRecordDose,
  onOpenHistory,
  onOpenSettings
}) => {
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);
  
  // Get drug profile
  const profile = timingProfiles[drug.name.toLowerCase()] || 
                 categoryProfiles[drug.category] || 
                 timingProfiles.default;

  // Get phase-specific styles
  const getPhaseStyles = (phase) => {
    switch (phase) {
      case 'onset':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'comeup':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'peak':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'offset':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'finished':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--:--';
    const { hours, minutes, seconds } = time;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Drug Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{drug.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {drug.category} • {drug.settings?.defaultDosage || drug.dosage} 
            {drug.settings?.defaultDosageUnit || drug.dosageUnit}
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
                   dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Phase Status */}
      <div className={`p-4 rounded-lg border ${getPhaseStyles(currentPhase)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <h3 className="font-medium">
              {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
            </h3>
          </div>
          <span className="font-mono">{formatTime(timeToNextPhase)}</span>
        </div>
        <p className="text-sm mt-2">
          {profile[currentPhase]?.safetyInfo || "Monitor effects carefully"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRecordDose}
          disabled={drug.settings?.trackSupply && drug.settings.currentSupply <= 0}
          className="flex items-center justify-center gap-2 p-3 bg-blue-500 dark:bg-blue-600 
                   text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{drug.settings?.trackSupply && drug.settings.currentSupply <= 0 
            ? 'No Supply' 
            : 'Record Dose'}</span>
        </button>
        <button
          onClick={onOpenHistory}
          className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 
                   dark:hover:bg-gray-600 transition-colors"
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>
      </div>

      {/* Supply Warning */}
      {drug.settings?.trackSupply && drug.settings.currentSupply <= 5 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 
                     border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <Package className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            Low supply: {drug.settings.currentSupply} 
            {drug.settings?.defaultDosageUnit || drug.dosageUnit} remaining
          </p>
        </div>
      )}

      {/* Safety Warnings */}
      {drug.warnings && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                     dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-200">{drug.warnings}</p>
          </div>
        </div>
      )}

      {/* Expandable Safety Info */}
      <button
        onClick={() => setShowSafetyInfo(!showSafetyInfo)}
        className="w-full flex items-center justify-between p-3 rounded-lg
                 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium">Safety Guidelines</span>
        {showSafetyInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showSafetyInfo && (
        <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border 
                     border-gray-200 dark:border-gray-700">
          {/* Vital Signs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Monitor: {profile[currentPhase]?.vitals?.join(', ') || 'General wellbeing'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {currentPhase === 'peak' 
                  ? 'Avoid strenuous activity' 
                  : 'Maintain comfortable activity level'}
              </p>
            </div>

            {timeToNextPhase && currentPhase !== 'finished' && (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Next phase ({timeToNextPhase.nextPhase}) in {formatTime(timeToNextPhase)}
                </p>
              </div>
            )}
          </div>

          {/* General Safety Tips */}
          <div className="space-y-2 pt-3 border-t dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Safety Tips</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                <span>Check interactions before mixing substances</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                <span>Stay hydrated but don't overdrink</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                <span>Have a trusted friend available</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDrugTracker;