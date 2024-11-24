import React from 'react';
import MobileModal from '../layout/MobileModal';

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
      title="Record Dose"
      fullScreen
    >
      <div className="p-4 space-y-6">
        {/* Dosage Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Dose Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={customDosage}
              onChange={(e) => onDosageChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={`Standard dose: ${drug.settings?.defaultDosage || drug.dosage} ${drug.dosageUnit}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {drug.dosageUnit}
            </span>
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Time Taken
          </label>
          <div className="flex gap-2">
            <select
              value={selectedTime}
              onChange={(e) => onTimeSelect(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRecord}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Record Dose
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </MobileModal>
  );
};

export default RecordDoseModal;