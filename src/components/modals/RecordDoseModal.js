// RecordDoseModal.js
import React from 'react';
import MobileModal from './MobileModal';
import { AlertTriangle, Plus } from 'lucide-react';

const RecordDoseModal = ({
  isOpen,
  onClose,
  drug,
  customDosage,
  selectedTime,
  customTime,
  onDosageChange,
  onTimeSelect,
  onTimeChange,
  onRecord,
  formatDateTimeLocal
}) => {
  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-gray-400" />
          <span className="text-white">Record Dose</span>
        </div>
      }
      fullScreen
    >
      <div className="p-4 space-y-6 bg-[#1a1f2e]">
        {/* Drug Info Header */}
        <div className="bg-[#232936] rounded-lg p-4">
          <h3 className="font-medium text-white text-lg">{drug.name}</h3>
          <p className="text-gray-400">{drug.category}</p>
        </div>

        {/* Dosage Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Dose Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={customDosage}
              onChange={(e) => onDosageChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg pr-16
                       bg-[#232936] border-none
                       text-white placeholder-gray-500
                       focus:ring-2 focus:ring-blue-500"
              placeholder={`Standard: ${drug.settings?.defaultDosage || drug.dosage}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {drug.dosageUnit}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Standard dose: {drug.settings?.defaultDosage || drug.dosage} {drug.dosageUnit}
          </p>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Time Taken
          </label>
          <select
            value={selectedTime}
            onChange={(e) => onTimeSelect(e.target.value)}
            className="w-full px-3 py-2 rounded-lg
                     bg-[#232936] border-none
                     text-white 
                     focus:ring-2 focus:ring-blue-500"
          >
            <option value="now">Just now</option>
            <option value="custom">Custom time</option>
          </select>
          {selectedTime === 'custom' && (
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => onTimeChange(e.target.value)}
              max={formatDateTimeLocal(new Date())}
              className="w-full px-3 py-2 rounded-lg mt-2
                       bg-[#232936] border-none
                       text-white
                       focus:ring-2 focus:ring-blue-500
                       [color-scheme:dark]"
            />
          )}
        </div>

        {/* Safety Warning */}
        {drug.warnings && (
          <div className="bg-[#2d1e24] border border-red-900/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-300">
                  Safety Warning
                </h4>
                <p className="mt-1 text-sm text-red-300/90">
                  {drug.warnings}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-[#1a1f2e] border-t border-gray-800 p-4 flex gap-3">
        <button
          onClick={onRecord}
          className="flex-1 bg-blue-500 hover:bg-blue-600
                   text-white px-4 py-2 rounded-lg transition-colors"
        >
          Record Dose
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-[#232936] hover:bg-[#2a3241]
                   text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </MobileModal>
  );
};

export default RecordDoseModal;