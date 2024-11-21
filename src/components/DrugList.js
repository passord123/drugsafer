import React, { useState } from 'react';
import { Trash2, Clock, Pill, Timer, CalendarClock, Package, AlertCircle } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

const DrugList = ({ drugs, onDelete, onSelect, selectedDrug }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState(null);

  const handleDrugSelect = (drug) => {
    onSelect(drug);
    if (window.innerWidth < 1024) {
      const trackerElement = document.querySelector('.drug-tracker');
      if (trackerElement) {
        setTimeout(() => {
          trackerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  const handleDeleteClick = (e, drug) => {
    e.stopPropagation();
    setDrugToDelete(drug);
    setShowDeleteConfirm(true);
  };

  const calculateDoseStatus = (doseTime, previousDoseTime, minTimeBetweenDoses) => {
    if (!previousDoseTime) return 'normal';
    const doseDate = new Date(doseTime);
    const prevDose = new Date(previousDoseTime);
    const hoursBetween = (doseDate - prevDose) / (1000 * 60 * 60);
    if (hoursBetween < minTimeBetweenDoses / 2) return 'early';
    if (hoursBetween < minTimeBetweenDoses) return 'warning';
    return 'normal';
  };

  const renderDrugInfo = (drug) => {
    const features = drug.settings?.features || {};
    
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <Pill className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>
            Standard dose: {drug.dosage || `${drug.settings?.defaultDosage?.amount} ${drug.settings?.defaultDosage?.unit}`}
          </span>
        </div>

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

        {features.supplyManagement && drug.settings?.currentSupply !== undefined && (
          <div className="flex items-center text-sm gap-2">
            <Package className="w-4 h-4 flex-shrink-0" />
            <span>{drug.settings.currentSupply} {drug.settings?.defaultDosage?.unit} remaining</span>
          </div>
        )}

        {drug.doses?.length > 0 && (
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Last dose: {new Date(drug.doses[0].timestamp).toLocaleString()}</span>
          </div>
        )}

        {drug.warnings && (
          <div className="col-span-2 flex items-start gap-2 text-red-600 mt-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{drug.warnings}</p>
          </div>
        )}
      </div>
    );
  };

  const getTodaysDoses = (drug) => {
    if (!drug.doses) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    return drug.doses.filter(dose => {
      const doseDate = new Date(dose.timestamp).setHours(0, 0, 0, 0);
      return doseDate === today;
    }).length;
  };

  const getTimeUntilNextDose = (drug) => {
    if (!drug.doses?.[0]) return null;
    const lastDoseTime = new Date(drug.doses[0].timestamp);
    const nextDoseTime = new Date(lastDoseTime.getTime() + (drug.settings.minTimeBetweenDoses * 60 * 60 * 1000));
    const now = new Date();
    if (now >= nextDoseTime) return 'Ready';
    const timeDiff = nextDoseTime - now;
    const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <div className="space-y-4">
      {drugs.map((drug) => (
        <div
          key={drug.id}
          onClick={() => handleDrugSelect(drug)}
          className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 
            ${selectedDrug?.id === drug.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            }`}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 text-lg">{drug.name}</h3>
                {drug.settings?.features?.timingRestrictions && (
                  <p className="text-sm text-gray-500">
                    Next dose: {getTimeUntilNextDose(drug)}
                  </p>
                )}
                {drug.settings?.features?.dailyLimits && (
                  <p className="text-sm text-gray-500">
                    Today: {getTodaysDoses(drug)} of {drug.settings?.maxDailyDoses} doses
                  </p>
                )}
              </div>
              <button
                onClick={(e) => handleDeleteClick(e, drug)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {renderDrugInfo(drug)}
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