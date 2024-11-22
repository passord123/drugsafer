import React, { useState } from 'react';
import { Trash2, Clock, Pill, Timer, AlertTriangle, Package, Calendar } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

const DrugList = ({ drugs, onDelete, onSelect, selectedDrug }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState(null);

  const handleDeleteClick = (e, drug) => {
    e.stopPropagation();
    setDrugToDelete(drug);
    setShowDeleteConfirm(true);
  };

  const calculateTimeUntilNextDose = (drug) => {
    if (!drug.doses?.[0]) return null;
    const lastDoseTime = new Date(drug.doses[0].timestamp);
    const nextDoseTime = new Date(lastDoseTime.getTime() + (drug.settings.minTimeBetweenDoses * 60 * 60 * 1000));
    const now = new Date();
    if (now >= nextDoseTime) return 'Ready';
    const timeDiff = nextDoseTime - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTodaysDoses = (drug) => {
    if (!drug.doses) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    return drug.doses.filter(dose => {
      const doseDate = new Date(dose.timestamp).setHours(0, 0, 0, 0);
      return doseDate === today;
    }).length;
  };

  return (
    <div className="space-y-4">
      {drugs.map((drug) => (
        <div
          key={drug.id}
          onClick={() => onSelect(drug)}
          className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 
            ${selectedDrug?.id === drug.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            }`}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 text-lg">{drug.name}</h3>
                <p className="text-sm text-gray-500">
                  {drug.category}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteClick(e, drug)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Dose Info */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Pill className="w-4 h-4 text-blue-500" />
                <span>Standard dose: {drug.settings?.defaultDosage || drug.dosage} {drug.settings?.defaultDosageUnit || drug.dosageUnit}</span>
              </div>

              {/* Time Between Doses */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Timer className="w-4 h-4 text-blue-500" />
                <span>{drug.settings?.minTimeBetweenDoses}h between doses</span>
              </div>

              {/* Daily Limit */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                  Today: {getTodaysDoses(drug)} of {drug.settings?.maxDailyDoses} max doses
                </span>
              </div>

              {/* Next Dose Timer */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Next dose: {calculateTimeUntilNextDose(drug)}</span>
              </div>

              {/* Supply Tracking */}
              {drug.settings?.trackSupply && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span>{drug.settings.currentSupply} {drug.settings.defaultDosageUnit} remaining</span>
                </div>
              )}
            </div>

            {/* Warnings */}
            {drug.warnings && (
              <div className="flex items-start gap-2 text-red-600 mt-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{drug.warnings}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDrugToDelete(null);
        }}
        onConfirm={() => {
          onDelete(drugToDelete.id);
          setShowDeleteConfirm(false);
          setDrugToDelete(null);
        }}
        title="Delete Drug"
        message={`Are you sure you want to delete ${drugToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default DrugList;