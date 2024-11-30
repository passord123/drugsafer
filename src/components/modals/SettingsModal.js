import React, { useState } from 'react';
import Modal from '../Modal';
import { Settings, AlertTriangle, Info, Package, Shield, Clock } from 'lucide-react';

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
      title={
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-900 dark:text-white">Drug Settings</span>
        </div>
      }
      fullScreen
    >
      <div className="p-4 space-y-6">
        {/* Drug Info Header */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white">{drug.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{drug.category}</p>
        </div>

        {/* Timeline Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Show Effect Timeline
            </label>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${showTimeline ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${showTimeline ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Display drug effect timeline and phase tracker
          </p>
        </div>

        {/* Standard Dose Setting */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Standard Dose ({drug.dosageUnit})
          </label>
          <input
            type="number"
            value={standardDose}
            onChange={(e) => setStandardDose(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            min="0"
            step="any"
          />
        </div>

        {/* Max Daily Doses */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Maximum Doses per Day
          </label>
          <input
            type="number"
            value={maxDailyDoses}
            onChange={(e) => setMaxDailyDoses(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            min="1"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Safety limit for daily doses
          </p>
        </div>

        {/* Timing Settings */}
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useRecommendedTiming}
              onChange={(e) => setUseRecommendedTiming(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600
                       text-blue-600 dark:text-blue-500
                       focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Use Recommended Timing
            </span>
          </label>

          {!useRecommendedTiming && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Custom Time Between Doses (hours)
              </label>
              <input
                type="number"
                value={minTimeBetweenDoses}
                onChange={(e) => setMinTimeBetweenDoses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600
                       text-blue-600 dark:text-blue-500
                       focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Track Supply
            </span>
          </label>

          {enableSupply && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Current Supply ({drug.dosageUnit})
              </label>
              <input
                type="number"
                value={currentSupply}
                onChange={(e) => setCurrentSupply(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                min="0"
                step="any"
              />
            </div>
          )}
        </div>

        {/* Safety Warning */}
        {drug.warnings && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Safety Information
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {drug.warnings}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 
                   text-white px-4 py-2 rounded-lg transition-colors"
        >
          Save Settings
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                   text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;