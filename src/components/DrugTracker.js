import React, { useState, useEffect } from 'react';
import { Clock, Settings, X, PlusCircle, AlertCircle } from 'lucide-react';
import SupplyTracker from './tracking/SupplyTracker';
import WarningSystem from './tracking/WarningSystem';

const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  console.log('Drug object:', drug);
  console.log('Drug settings:', drug.settings);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingDose, setIsEditingDose] = useState(false);
  const [customDosage, setCustomDosage] = useState(
    typeof drug.settings?.defaultDosage === 'object' ?
      drug.settings?.defaultDosage?.amount :
      drug.settings?.defaultDosage || ''
  );
  const [dosageUnit, setDosageUnit] = useState(drug.settings?.defaultDosageUnit || 'mg');
  const [maxDailyDoses, setMaxDailyDoses] = useState(drug.settings?.maxDailyDoses || 4);
  const [waitingPeriod, setWaitingPeriod] = useState(drug.settings?.minTimeBetweenDoses || 4);
  const [supplyAmount, setSupplyAmount] = useState(drug.settings?.currentSupply || 0);
  const [features, setFeatures] = useState(drug.settings?.features || {
    supplyManagement: true,
    dailyLimits: true,
    timingRestrictions: true
  });


  // Sync state with prop changes
  useEffect(() => {
    setCustomDosage(
      typeof drug.settings?.defaultDosage === 'object' ?
        drug.settings?.defaultDosage?.amount :
        drug.settings?.defaultDosage || ''
    );
    setDosageUnit(drug.settings?.defaultDosageUnit || 'mg');
    setMaxDailyDoses(drug.settings?.maxDailyDoses || 4);
    setWaitingPeriod(drug.settings?.minTimeBetweenDoses || 4);
    setSupplyAmount(drug.settings?.currentSupply || 0);
  }, [drug]);

  const getTimeUntilNextDose = () => {
    if (!drug.doses?.[0]) return null;

    const lastDoseTime = new Date(drug.doses[0].timestamp);
    const nextDoseTime = new Date(lastDoseTime.getTime() + (waitingPeriod * 60 * 60 * 1000));
    const now = new Date();

    if (now >= nextDoseTime) return 'Ready for next dose';

    const timeDiff = nextDoseTime - now;
    const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m until next dose`;
  };

  const getTodaysDoses = () => {
    if (!drug.doses) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    return drug.doses.filter(dose => {
      const doseDate = new Date(dose.timestamp).setHours(0, 0, 0, 0);
      return doseDate === today;
    }).length;
  };

  const handleRecordDose = () => {
    if (!customDosage) {
      alert('Please enter a valid dosage amount');
      return;
    }

    // Only check daily limits if the feature is enabled
    if (drug.settings?.features?.dailyLimits) {
      const todaysDoses = getTodaysDoses();
      if (todaysDoses >= maxDailyDoses) {
        alert('Maximum daily doses reached');
        return;
      }
    }

    // Only update supply if supply management is enabled
    const updatedSupply = drug.settings?.features?.supplyManagement
      ? Math.max(0, Number(supplyAmount) - 1)
      : drug.settings?.currentSupply || 0;

    onRecordDose(drug.id, `${customDosage} ${dosageUnit}`, updatedSupply);
    setIsEditingDose(false);
    setCustomDosage(drug.settings?.defaultDosage || ''); // Changed this line
  };

  const handleUpdateSettings = () => {
    if (features.dailyLimits && (!maxDailyDoses || maxDailyDoses < 1)) {
      alert('Please enter a valid number for maximum daily doses');
      return;
    }

    if (features.timingRestrictions && (!waitingPeriod || waitingPeriod < 0)) {
      alert('Please enter a valid waiting period');
      return;
    }

    onUpdateSettings(drug.id, {
      ...drug.settings,
      defaultDosage: customDosage, // Just save the value directly
      defaultDosageUnit: dosageUnit,
      maxDailyDoses: Number(maxDailyDoses),
      minTimeBetweenDoses: Number(waitingPeriod),
      currentSupply: Number(supplyAmount),
      features: {
        ...drug.settings?.features,
        ...features,
        doseTracking: true,
        interactionChecking: true,
        adherenceTracking: true
      }
    });
    setShowSettings(false);
  };

  // Settings Modal Component
  const SettingField = ({ label, checked, onToggle, children }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Enable</span>
        </label>
      </div>
      {checked && children}
    </div>
  );

  // Create checkbox component
  const FeatureCheckbox = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  const shouldShowDoseStatus = () =>
    drug.settings?.features?.timingRestrictions || drug.settings?.features?.dailyLimits;

  // Helper to determine if supply management should be shown
  const shouldShowSupplyManagement = () =>
    drug.settings?.features?.supplyManagement;

  // Helper to determine grid columns
  const getGridClass = () => {
    const bothEnabled = shouldShowDoseStatus() && shouldShowSupplyManagement();
    return bothEnabled ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{drug.name}</h2>
          <p className="text-sm text-gray-500">
            Standard dose: {drug.dosage || `${drug.settings?.defaultDosage} ${drug.settings?.defaultDosageUnit}`}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Status Cards */}
      {(shouldShowDoseStatus() || shouldShowSupplyManagement()) && (
        <div className={`grid ${getGridClass()} gap-4`}>
          {/* Dose Status */}
          {shouldShowDoseStatus() && (
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Dose Status</h3>
              </div>
              <div className="space-y-2">
                {drug.settings?.features?.dailyLimits && (
                  <p className="text-sm text-gray-600">
                    Today: {getTodaysDoses()} of {maxDailyDoses} doses taken
                  </p>
                )}
                {drug.settings?.features?.timingRestrictions && (
                  <p className="text-sm text-gray-600">
                    {getTimeUntilNextDose() || 'No doses recorded'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Supply Status */}
          {shouldShowSupplyManagement() && (
            <SupplyTracker
              currentSupply={Number(drug.settings?.currentSupply || 0)}
              unit={drug.settings?.defaultDosageUnit || 'doses'}
            />
          )}
        </div>
      )}

      {/* Recent Doses - Always shown (part of core dose tracking) */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Recent Doses</h3>
        </div>
        <div className="divide-y max-h-[300px] overflow-y-auto">
          {drug.doses?.length > 0 ? (
            drug.doses.slice(0, 5).map((dose, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{dose.dosage}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(dose.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {/* Show warning icons only if timing restrictions are enabled */}
                  {drug.settings?.features?.timingRestrictions && dose.status !== 'normal' && (
                    <AlertCircle className={`w-5 h-5 ${dose.status === 'early' ? 'text-red-500' : 'text-yellow-500'
                      }`} />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No doses recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Record Dose Button/Form - Always shown but with feature-based validation */}
      {isEditingDose ? (
        <div className="fixed inset-x-0 bottom-0 bg-white border-t p-4 md:relative md:border-0 md:bg-transparent md:p-0">
          <div className="flex gap-2 max-w-lg mx-auto">
            <input
              type="number"
              value={customDosage}
              onChange={(e) => setCustomDosage(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter dosage"
            />
            <select
              value={dosageUnit}
              onChange={(e) => setDosageUnit(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="g">g</option>
              <option value="tablets">tablets</option>
            </select>
            <button
              onClick={handleRecordDose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Record
            </button>
            <button
              onClick={() => setIsEditingDose(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditingDose(true)}
          className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 
                   bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Record New Dose</span>
        </button>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Medication Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <SettingField
                label="Daily Dose Limits"
                checked={features.dailyLimits}
                onToggle={(checked) => setFeatures(prev => ({
                  ...prev,
                  dailyLimits: checked
                }))}
              >
                <input
                  type="number"
                  value={maxDailyDoses}
                  onChange={(e) => setMaxDailyDoses(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </SettingField>

              <SettingField
                label="Timing Restrictions"
                checked={features.timingRestrictions}
                onToggle={(checked) => setFeatures(prev => ({
                  ...prev,
                  timingRestrictions: checked
                }))}
              >
                <input
                  type="number"
                  value={waitingPeriod}
                  onChange={(e) => setWaitingPeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.5"
                  placeholder="Hours between doses"
                />
              </SettingField>

              <SettingField
                label="Supply Management"
                checked={features.supplyManagement}
                onToggle={(checked) => setFeatures(prev => ({
                  ...prev,
                  supplyManagement: checked
                }))}
              >
                <input
                  type="number"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Current supply amount"
                />
              </SettingField>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateSettings}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugTracker;