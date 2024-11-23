import React from 'react';
import { History, Settings, Clock, Package } from 'lucide-react';

const DrugTrackerHeader = ({ 
  drug, 
  onOpenHistory, 
  onOpenSettings,
  lastDoseTime 
}) => {
  const formatLastDose = (timestamp) => {
    if (!timestamp) return 'No doses recorded';
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Last dose: Today at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffHours < 48) {
      return `Last dose: Yesterday at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return `Last dose: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{drug.name}</h2>
          <p className="text-sm text-gray-500">
            Standard dose: {drug.settings?.defaultDosage || drug.dosage} {drug.dosageUnit}
          </p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* New prominent action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onOpenHistory}
          className="flex items-center justify-center gap-2 p-3 bg-blue-50 
                   hover:bg-blue-100 text-blue-700 rounded-lg transition-colors
                   border border-blue-200"
        >
          <History className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">View History</div>
            <div className="text-sm">
              {drug.doses?.length || 0} total doses
            </div>
          </div>
        </button>

        <div className="flex items-center justify-center gap-2 p-3 
                      bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
          <Clock className="w-5 h-5 text-gray-500" />
          <div className="text-left">
            <div className="font-medium">Last Dose</div>
            <div className="text-sm">
              {formatLastDose(drug.doses?.[0]?.timestamp)}
            </div>
          </div>
        </div>
      </div>

      {/* Supply tracking if enabled */}
      {drug.settings?.trackSupply && (
        <div className={`p-3 rounded-lg border flex items-center gap-3
          ${drug.settings.currentSupply <= 0 ? 'bg-red-50 border-red-200' :
            drug.settings.currentSupply <= 5 ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'}`}
        >
          <Package className="w-5 h-5" />
          <div>
            <div className="font-medium">Current Supply</div>
            <div className="text-sm">
              {drug.settings.currentSupply} {drug.settings.defaultDosageUnit || drug.dosageUnit} remaining
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugTrackerHeader;