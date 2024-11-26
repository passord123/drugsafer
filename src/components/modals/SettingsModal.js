import React, { useState } from 'react';
import Modal from '../Modal';

const SettingsModal = ({
  isOpen,
  onClose,
  drug,
  settings,
  onSave
}) => {
  const [showTimeline, setShowTimeline] = useState(settings?.showTimeline ?? true);
  const [standardDose, setStandardDose] = useState(settings?.standardDose || '');
  const [maxDailyDoses, setMaxDailyDoses] = useState(settings?.maxDailyDoses || 4);
  const [useRecommendedTiming, setUseRecommendedTiming] = useState(settings?.useRecommendedTiming ?? true);
  const [minTimeBetweenDoses, setMinTimeBetweenDoses] = useState(settings?.minTimeBetweenDoses || 4);
  const [enableSupply, setEnableSupply] = useState(settings?.enableSupply ?? false);
  const [currentSupply, setCurrentSupply] = useState(settings?.currentSupply || 0);

  const handleSave = () => {
    onSave({
      showTimeline,
      defaultDosage: standardDose,
      maxDailyDoses: Number(maxDailyDoses),
      useRecommendedTiming,
      minTimeBetweenDoses: Number(minTimeBetweenDoses),
      trackSupply: enableSupply,
      currentSupply: Number(currentSupply)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Drug Settings"
      fullScreen
    >
      <div className="p-4 space-y-6">
        {/* Timeline Toggle */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTimeline}
              onChange={(e) => setShowTimeline(e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Effect Timeline
            </span>
          </label>
        </div>

        {/* Standard Dose Setting */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Standard Dose ({drug.dosageUnit})
          </label>
          <input
            type="number"
            value={standardDose}
            onChange={(e) => setStandardDose(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            step="any"
          />
        </div>

        {/* Max Daily Doses */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Maximum Doses per Day
          </label>
          <input
            type="number"
            value={maxDailyDoses}
            onChange={(e) => setMaxDailyDoses(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        {/* Timing Settings */}
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useRecommendedTiming}
              onChange={(e) => setUseRecommendedTiming(e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Use Recommended Timing
            </span>
          </label>

          {!useRecommendedTiming && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Custom Time Between Doses (hours)
              </label>
              <input
                type="number"
                value={minTimeBetweenDoses}
                onChange={(e) => setMinTimeBetweenDoses(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.5"
              />
            </div>
          )}
        </div>

        {/* Supply Management */}
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enableSupply}
              onChange={(e) => {
                setEnableSupply(e.target.checked);
                if (!e.target.checked) {
                  setCurrentSupply(0);
                }
              }}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Track Supply
            </span>
          </label>

          {enableSupply && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Supply ({drug.dosageUnit})
              </label>
              <input
                type="number"
                value={currentSupply}
                onChange={(e) => setCurrentSupply(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="any"
              />
            </div>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;