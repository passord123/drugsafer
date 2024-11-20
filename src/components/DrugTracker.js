import React, { useState } from 'react';
import { Clock, Settings, X, PlusCircle, AlertCircle } from 'lucide-react';
import SupplyTracker from './tracking/SupplyTracker';
import WarningSystem from './tracking/WarningSystem';

const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingDose, setIsEditingDose] = useState(false);
  const [customDosage, setCustomDosage] = useState(drug.settings?.defaultDosage?.amount || '');
  const [dosageUnit, setDosageUnit] = useState(drug.settings?.defaultDosage?.unit || 'mg');
  const [maxDailyDoses, setMaxDailyDoses] = useState(drug.settings?.maxDailyDoses || 4);
  const [waitingPeriod, setWaitingPeriod] = useState(drug.settings?.minTimeBetweenDoses || 4);
  const [supplyAmount, setSupplyAmount] = useState(drug.settings?.currentSupply || 0);

  const getTimeUntilNextDose = () => {
    if (!drug.doses?.[0]) return null;
    
    const lastDoseTime = new Date(drug.doses[0].timestamp);
    const nextDoseTime = new Date(lastDoseTime.getTime() + waitingPeriod * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= nextDoseTime) return 'Ready for next dose';
    
    const diffHours = Math.floor((nextDoseTime - now) / (1000 * 60 * 60));
    const diffMinutes = Math.floor(((nextDoseTime - now) % (1000 * 60 * 60)) / (1000 * 60));
    
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
    const updatedSupply = Math.max(0, (drug.settings?.currentSupply || 0) - 1);
    onRecordDose(drug.id, `${customDosage} ${dosageUnit}`, updatedSupply);
    setIsEditingDose(false);
    setCustomDosage('');
  };

  const handleUpdateSettings = () => {
    onUpdateSettings(drug.id, {
      maxDailyDoses,
      minTimeBetweenDoses: waitingPeriod,
      currentSupply: supplyAmount,
      defaultDosage: {
        amount: customDosage || drug.settings?.defaultDosage?.amount,
        unit: dosageUnit
      }
    });
    setShowSettings(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{drug.name}</h2>
          <p className="text-sm text-gray-500">
            Standard dose: {drug.settings?.defaultDosage?.amount} {drug.settings?.defaultDosage?.unit}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dose Status */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Dose Status</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Today: {getTodaysDoses()} of {maxDailyDoses} doses taken
            </p>
            <p className="text-sm text-gray-600">
              {getTimeUntilNextDose() || 'No doses recorded'}
            </p>
          </div>
        </div>

        {/* Supply Status */}
        <SupplyTracker
          currentSupply={drug.settings?.currentSupply || 0}
          unit={drug.settings?.defaultDosage?.unit || 'doses'}
        />
      </div>

      {/* Recent Doses */}
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
                  {dose.status !== 'normal' && (
                    <AlertCircle className={`w-5 h-5 ${
                      dose.status === 'early' ? 'text-red-500' : 'text-yellow-500'
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

      {/* Record Dose Button */}
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Medication Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hours Between Doses
                </label>
                <input
                  type="number"
                  value={waitingPeriod}
                  onChange={(e) => setWaitingPeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Supply
                </label>
                <input
                  type="number"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3">
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