import React from 'react';
import { Clock, History, Settings } from 'lucide-react';

const DrugTrackerHeader = ({ 
  drug, 
  onOpenHistory, 
  onOpenSettings,
  lastDoseTime,
}) => {
  const formatLastDose = (timestamp) => {
    if (!timestamp) return { time: 'No doses recorded', dose: '' };
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    const lastDose = drug.doses?.[0];
    const doseAmount = lastDose ? `${lastDose.dosage} ${drug.settings?.defaultDosageUnit || drug.dosageUnit}` : '';
    
    let timeStr;
    if (diffHours < 24) {
      timeStr = `Today at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffHours < 48) {
      timeStr = `Yesterday at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      timeStr = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }

    return { time: timeStr, dose: doseAmount };
  };

  const lastDoseInfo = formatLastDose(lastDoseTime);

  return (
    <div>
      {/* Drug Info and Settings Button */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{drug.name}</h2>
          <p className="text-sm text-gray-500">
            Standard dose: {drug.settings?.defaultDosage || drug.dosage} {drug.settings?.defaultDosageUnit || drug.dosageUnit}
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-3 p-4 bg-blue-50 
                   hover:bg-blue-100 text-blue-700 rounded-lg transition-colors
                   border border-blue-200"
        >
          <History className="w-5 h-5 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="font-medium">View History</div>
            <div className="text-sm">
              {drug.doses?.length || 0} total doses
            </div>
          </div>
        </button>

        {/* Last Dose Timer */}
        <div className="p-4 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="font-medium">Last Dose</div>
          </div>
          <div className="ml-8 space-y-0.5">
            <div className="text-sm truncate">
              {lastDoseInfo.time}
            </div>
            {lastDoseInfo.dose && (
              <div className="text-sm font-medium text-gray-900">
                {lastDoseInfo.dose}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugTrackerHeader;