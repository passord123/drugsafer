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
  Info,
  PlusCircle,
  History
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
  const [showSafety, setShowSafety] = useState(false);
  
  // Get drug profile
  const profile = timingProfiles[drug.name.toLowerCase()] || 
                 categoryProfiles[drug.category] || 
                 timingProfiles.default;

  // Get phase-specific styles
  const getPhaseStyles = (phase) => {
    switch (phase) {
      case 'onset':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200';
      case 'comeup':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-200';
      case 'peak':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200';
      case 'offset':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200';
      case 'finished':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-200';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200';
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
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                   hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Current Phase Card */}
      <div className={`rounded-lg border p-4 ${getPhaseStyles(currentPhase)}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                {currentPhase === 'finished' ? 'Effects Complete' : 
                 `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase`}
              </h3>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {profile[currentPhase]?.safetyInfo || "Monitor effects carefully"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {formatTime(timeToNextPhase)}
            </div>
            <div className="text-sm opacity-75">until next phase</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 dark:bg-black/10 rounded-lg p-3">
            <div className="text-sm opacity-75">Standard Dose</div>
            <div className="font-semibold">
              {drug.settings?.defaultDosage || drug.dosage} {drug.dosageUnit}
            </div>
          </div>
          {drug.settings?.trackSupply && (
            <div className="bg-white/10 dark:bg-black/10 rounded-lg p-3">
              <div className="text-sm opacity-75">Supply Left</div>
              <div className="font-semibold">
                {drug.settings.currentSupply} {drug.dosageUnit}
              </div>
            </div>
          )}
        </div>
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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRecordDose}
          disabled={drug.settings?.trackSupply && drug.settings.currentSupply <= 0}
          className="flex items-center justify-center gap-2 p-3 rounded-lg
                   bg-blue-500 dark:bg-blue-600 text-white
                   hover:bg-blue-600 dark:hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{drug.settings?.trackSupply && drug.settings.currentSupply <= 0 
            ? 'No Supply' : 'Record Dose'}</span>
        </button>
        <button
          onClick={onOpenHistory}
          className="flex items-center justify-center gap-2 p-3 rounded-lg
                   bg-gray-100 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300
                   hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>
      </div>

      {/* Safety Info Section */}
      <button
        onClick={() => setShowSafety(!showSafety)}
        className="w-full flex items-center justify-between p-4 rounded-lg
                 bg-gray-50 dark:bg-gray-700/50 
                 text-gray-900 dark:text-white"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <span className="font-medium">Safety Guidelines</span>
        </div>
        {showSafety ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showSafety && (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          {/* Drug Warnings */}
          {drug.warnings && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-200">{drug.warnings}</p>
            </div>
          )}

          <div className="space-y-3">
            {/* Vital Signs */}
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Monitor: {profile[currentPhase]?.vitals?.join(', ') || 'General wellbeing'}
              </span>
            </div>

            {/* Activity Level */}
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentPhase === 'peak' 
                  ? 'Avoid strenuous activity' 
                  : 'Maintain comfortable activity level'}
              </span>
            </div>

            {/* Phase Timeline */}
            {timeToNextPhase && currentPhase !== 'finished' && (
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Next phase ({timeToNextPhase.nextPhase}) in {formatTime(timeToNextPhase)}
                </span>
              </div>
            )}

            {/* Safety Tips */}
            <div className="pt-3 border-t dark:border-gray-700 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Key Safety Tips
              </h4>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Check interactions before mixing substances
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Stay hydrated but don't overdrink
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Have a trusted friend available
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDrugTracker;