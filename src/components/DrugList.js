// src/components/DrugList.js
import React from 'react';
import { Trash2, Clock } from 'lucide-react';

const DrugList = ({ drugs, onDelete, onSelect, selectedDrug }) => (
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
        <div className="flex justify-between">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{drug.name}</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Dosage: {drug.settings?.defaultDosage?.amount} {drug.settings?.defaultDosage?.unit}
              </p>
              <p className="text-sm text-gray-600">
                Minimum wait: {drug.settings?.waitingPeriod} hours
              </p>
              <p className="text-sm text-gray-600">
                Max daily doses: {drug.settings?.maxDailyDoses}
              </p>
            </div>
            {drug.doses?.length > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last dose: {new Date(drug.doses[0].timestamp).toLocaleString()}
              </div>
            )}
          </div>
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
      </div>
    ))}
    {drugs.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        No medications found
      </div>
    )}
  </div>
);

export default DrugList;