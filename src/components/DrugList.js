// src/components/DrugList.js
import React from 'react';
import { Trash2, Clock, Pill, Timer, CalendarClock, Package, AlertCircle } from 'lucide-react';

const DrugList = ({ drugs, onDelete, onSelect, selectedDrug }) => {
  const renderDrugInfo = (drug) => {
    const features = drug.settings?.features || {};
    
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {/* Always show standard dose */}
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <Pill className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>
            Standard dose: {drug.dosage || `${drug.settings?.defaultDosage?.amount} ${drug.settings?.defaultDosage?.unit}`}
          </span>
        </div>

        {/* Conditional feature displays */}
        {features.timingRestrictions && (
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Timer className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>{drug.settings?.minTimeBetweenDoses}h between doses</span>
          </div>
        )}

        {features.dailyLimits && (
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <CalendarClock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>Max {drug.settings?.maxDailyDoses} doses per day</span>
          </div>
        )}

        {features.supplyManagement && (
          <div className="flex items-center text-sm gap-2">
            <Package className="w-4 h-4 flex-shrink-0" />
            <span>{drug.settings?.currentSupply} {drug.settings?.defaultDosage?.unit} remaining</span>
          </div>
        )}

        {features.doseTracking && drug.doses?.length > 0 && (
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Last dose: {new Date(drug.doses[0].timestamp).toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {drugs.map((drug) => (
        <div
          key={drug.id}
          onClick={() => onSelect(drug)}
          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 
            ${selectedDrug?.id === drug.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            }`}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900 text-lg">{drug.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(drug.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {renderDrugInfo(drug)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrugList;