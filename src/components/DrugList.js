import React, { useState } from 'react';
import { Trash2, Clock, Pill, Timer, AlertTriangle, Package, Activity, HeartPulse, Shield } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';
import { getDrugTiming, calculateNextDoseTime, checkDoseSafety } from '../utils/drugTimingHandler';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const DrugList = ({ drugs = [], onDelete, onSelect, selectedDrug }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState(null);

  const handleDeleteClick = (e, drug) => {
    e.stopPropagation();
    setDrugToDelete(drug);
    setShowDeleteConfirm(true);
  };

  const getTodaysDoses = (drug) => {
    if (!drug.doses?.length) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    return drug.doses.filter(dose => {
      const doseDate = new Date(dose.timestamp).setHours(0, 0, 0, 0);
      return doseDate === today;
    }).length;
  };

  const getMaxDailyDoses = (drug) => {
    // First check user settings
    if (drug.settings?.maxDailyDoses) {
      return drug.settings.maxDailyDoses;
    }

    // Then check drug configuration
    const profile = timingProfiles[drug.name.toLowerCase()] || 
                   categoryProfiles[drug.category] || 
                   timingProfiles.default;
    
    const totalMinutes = profile.total();
    const recommendedHours = totalMinutes / 60;
    return Math.floor(24 / recommendedHours);
  };

  const calculateTimeUntilNextDose = (drug) => {
    if (!drug.doses?.[0]) return 'Ready';
    
    const nextDoseTime = calculateNextDoseTime(drug, drug.doses[0].timestamp);
    if (!nextDoseTime) return 'Ready';

    const now = new Date();
    if (now >= nextDoseTime) return 'Ready';
    
    const timeDiff = nextDoseTime - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getDrugStatus = (drug) => {
    if (!drug.doses?.length) return { safe: true };
    
    const now = new Date();
    return checkDoseSafety(drug, now.toISOString());
  };

  const getStatusColor = (status) => {
    if (status.quotaExceeded) {
      return 'text-red-600 dark:text-red-400';
    }
    if (!status.safe) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-4">
      {drugs.map((drug) => {
        const status = getDrugStatus(drug);
        const todaysDoses = getTodaysDoses(drug);
        const maxDoses = getMaxDailyDoses(drug);

        return (
          <div
            key={drug.id}
            onClick={() => onSelect(drug)}
            className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 
              ${selectedDrug?.id === drug.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              }`}
          >
            <div className="space-y-4">
              {/* Header with name and delete button */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-lg">{drug.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{drug.category}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, drug)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 
                           hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Standard Dose */}
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Pill className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>Standard dose: {drug.settings?.defaultDosage || drug.dosage} {drug.settings?.defaultDosageUnit || drug.dosageUnit}</span>
                </div>

                {/* Time Between Doses */}
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Timer className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>
                    {drug.formattedTimeBetweenDoses} between doses
                  </span>
                </div>

                {/* Today's Doses */}
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className={todaysDoses >= maxDoses ? 'text-red-600 dark:text-red-400' : ''}>
                    Today: {todaysDoses} of {maxDoses} max doses
                  </span>
                </div>

                {/* Next Dose Timer */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className={getStatusColor(status)}>
                    Next dose: {calculateTimeUntilNextDose(drug)}
                  </span>
                </div>

                {/* Supply Information (if tracking enabled) */}
                {drug.settings?.trackSupply && (
                  <div className={`flex items-center gap-3 text-sm ${
                    drug.settings.currentSupply <= 5 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    <Package className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>{drug.settings.currentSupply} {drug.settings.defaultDosageUnit} remaining</span>
                  </div>
                )}
              </div>

              {/* Safety Status */}
              {(status.quotaExceeded || !status.safe) && (
                <div className={`flex items-start gap-2 p-3 rounded-lg ${
                  status.quotaExceeded 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    status.quotaExceeded 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-yellow-500 dark:text-yellow-400'
                  }`} />
                  <p className={`text-sm ${
                    status.quotaExceeded 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {status.reason}
                  </p>
                </div>
              )}

              {/* Warnings */}
              {drug.warnings && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <Shield className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{drug.warnings}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
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