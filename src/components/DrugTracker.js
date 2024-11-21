import React, { useState, useEffect } from 'react';
import { Clock, Settings, X, PlusCircle, Pencil, Trash2, AlertCircle, Package } from 'lucide-react';
import SupplyTracker from './tracking/SupplyTracker';
import WarningSystem from './tracking/WarningSystem';

const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingDose, setIsEditingDose] = useState(false);
  const [editingDoseId, setEditingDoseId] = useState(null);
  const [customDosage, setCustomDosage] = useState(
    typeof drug.settings?.defaultDosage === 'object' ?
      drug.settings?.defaultDosage?.amount :
      drug.settings?.defaultDosage || ''
  );
  const [dosageUnit, setDosageUnit] = useState(drug.settings?.defaultDosageUnit || 'mg');
  const [maxDailyDoses, setMaxDailyDoses] = useState(drug.settings?.maxDailyDoses || 4);
  const [waitingPeriod, setWaitingPeriod] = useState(drug.settings?.minTimeBetweenDoses || 4);
  const [supplyAmount, setSupplyAmount] = useState(drug.settings?.currentSupply || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doseToDelete, setDoseToDelete] = useState(null);
  const [doseDate, setDoseDate] = useState('');
  const [doseTime, setDoseTime] = useState('');
  const [features, setFeatures] = useState(drug.settings?.features || {
    supplyManagement: true,
    dailyLimits: true,
    timingRestrictions: true
  });
  const [standardDoseAmount, setStandardDoseAmount] = useState(
    drug.settings?.defaultDosage?.amount || drug.settings?.defaultDosage || ''
  );
  const [standardDoseUnit, setStandardDoseUnit] = useState(
    drug.settings?.defaultDosage?.unit || drug.settings?.defaultDosageUnit || 'mg'
  );

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
    setStandardDoseAmount(
      drug.settings?.defaultDosage?.amount || drug.settings?.defaultDosage || ''
    );
    setStandardDoseUnit(
      drug.settings?.defaultDosage?.unit || drug.settings?.defaultDosageUnit || 'mg'
    );
  }, [drug]);

  // Set default date and time when not editing
  useEffect(() => {
    if (!isEditingDose) {
      const now = new Date();
      const { dateStr, timeStr } = formatDateTimeForInput(now);
      setDoseDate(dateStr);
      setDoseTime(timeStr);
    }
  }, [isEditingDose]);

  const formatDateTimeForInput = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().slice(0, 5);
    return { dateStr, timeStr };
  };

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

  const calculateDoseStatus = (doseTime, previousDoseTime) => {
    if (!previousDoseTime) return 'normal';

    const doseDate = new Date(doseTime);
    const prevDose = new Date(previousDoseTime);
    const hoursBetween = (doseDate - prevDose) / (1000 * 60 * 60);

    if (hoursBetween < waitingPeriod / 2) return 'early';
    if (hoursBetween < waitingPeriod) return 'warning';
    return 'normal';
  };

  const handleEditDose = (dose) => {
    setEditingDoseId(dose.id);
    setIsEditingDose(true);
    const [amount, unit] = dose.dosage.split(' ');
    setCustomDosage(amount);
    setDosageUnit(unit);

    // Set date and time from timestamp
    const { dateStr, timeStr } = formatDateTimeForInput(dose.timestamp);
    setDoseDate(dateStr);
    setDoseTime(timeStr);
  };

  const handleDeleteDose = (doseId) => {
    setDoseToDelete(doseId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDose = () => {
    const updatedDoses = drug.doses.filter(dose => dose.id !== doseToDelete);
    const updatedDrug = {
      ...drug,
      doses: updatedDoses
    };

    onUpdateSettings(drug.id, updatedDrug);
    setShowDeleteConfirm(false);
    setDoseToDelete(null);
  };
  const handleUpdateDose = () => {
    if (!customDosage || customDosage <= 0) {
      alert('Please enter a valid dosage amount');
      return;
    }

    if (!doseDate || !doseTime) {
      alert('Please enter a valid date and time');
      return;
    }

    const timestamp = new Date(`${doseDate}T${doseTime}`);
    if (isNaN(timestamp.getTime())) {
      alert('Invalid date or time');
      return;
    }

    const updatedDoses = drug.doses.map(dose => {
      if (dose.id === editingDoseId) {
        return {
          ...dose,
          dosage: `${customDosage} ${dosageUnit}`,
          timestamp: timestamp.toISOString(),
          edited: true,
          editedAt: new Date().toISOString()
        };
      }
      return dose;
    });

    // Sort doses by timestamp in descending order
    const sortedDoses = updatedDoses.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    const updatedDrug = {
      ...drug,
      doses: sortedDoses
    };

    onUpdateSettings(drug.id, updatedDrug);
    setIsEditingDose(false);
    setEditingDoseId(null);
    setCustomDosage('');
    setDoseDate('');
    setDoseTime('');
  };

  const handleRecordDose = () => {
    if (!customDosage || customDosage <= 0) {
      alert('Please enter a valid dosage amount');
      return;
    }

    if (!doseDate || !doseTime) {
      alert('Please enter a valid date and time');
      return;
    }

    const timestamp = new Date(`${doseDate}T${doseTime}`);
    if (isNaN(timestamp.getTime())) {
      alert('Invalid date or time');
      return;
    }

    // Only check daily limits if the feature is enabled
    if (features.dailyLimits) {
      const todaysDoses = getTodaysDoses();
      if (todaysDoses >= maxDailyDoses) {
        alert('Maximum daily doses reached');
        return;
      }
    }

    // Only update supply if supply management is enabled
    const updatedSupply = features.supplyManagement
      ? Math.max(0, Number(supplyAmount) - 1)
      : drug.settings?.currentSupply || 0;

    const newDose = {
      id: Date.now(),
      timestamp: timestamp.toISOString(),
      dosage: `${customDosage} ${dosageUnit}`,
      status: calculateDoseStatus(
        timestamp.toISOString(),
        drug.doses?.[0]?.timestamp
      )
    };

    // Add new dose and sort all doses by timestamp
    const sortedDoses = [newDose, ...(drug.doses || [])].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    const updatedDrug = {
      ...drug,
      doses: sortedDoses,
      settings: {
        ...drug.settings,
        currentSupply: updatedSupply
      }
    };

    onUpdateSettings(drug.id, updatedDrug);
    onRecordDose(drug.id, `${customDosage} ${dosageUnit}`, updatedSupply);

    setIsEditingDose(false);
    setCustomDosage('');
    setDoseDate('');
    setDoseTime('');
  };

  const handleUpdateSettings = () => {
    if (!standardDoseAmount || standardDoseAmount <= 0) {
      alert('Please enter a valid standard dose amount');
      return;
    }

    onUpdateSettings(drug.id, {
      ...drug.settings,
      defaultDosage: {
        amount: standardDoseAmount,
        unit: standardDoseUnit
      },
      features: {
        ...features,
        doseTracking: true,
        interactionChecking: true,
        adherenceTracking: true
      },
      maxDailyDoses: Number(maxDailyDoses),
      minTimeBetweenDoses: Number(waitingPeriod),
      currentSupply: Number(supplyAmount)
    });
    setShowSettings(false);
  };

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

  const shouldShowDoseStatus = () =>
    features.timingRestrictions || features.dailyLimits;

  const shouldShowSupplyManagement = () =>
    features.supplyManagement;

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
            Standard dose: {typeof drug.settings?.defaultDosage === 'object'
              ? `${drug.settings.defaultDosage.amount} ${drug.settings.defaultDosage.unit}`
              : `${standardDoseAmount} ${standardDoseUnit}`
            }
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
                {features.dailyLimits && (
                  <p className="text-sm text-gray-600">
                    Today: {getTodaysDoses()} of {maxDailyDoses} doses taken
                  </p>
                )}
                {features.timingRestrictions && (
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

      {/* Recent Doses */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Recent Doses</h3>
        </div>
        <div className="divide-y max-h-[300px] overflow-y-auto">
          {drug.doses?.length > 0 ? (
            drug.doses.map((dose) => (
              <div key={dose.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{dose.dosage}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(dose.timestamp).toLocaleString()}
                      {dose.edited && (
                        <span className="ml-2 text-blue-500">(edited)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditDose(dose)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDose(dose.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {features.timingRestrictions && dose.status !== 'normal' && (
                      <AlertCircle
                        className={`w-5 h-5 ${dose.status === 'early' ? 'text-red-500' : 'text-yellow-500'
                          }`}
                      />
                    )}
                  </div>
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

      {/* Record/Edit Dose Form */}
      {isEditingDose && (
        <div className="fixed inset-x-0 bottom-0 bg-white border-t p-4 md:relative md:border-0 md:bg-transparent md:p-0">
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <div className="flex gap-2">
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
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={doseDate}
                onChange={(e) => setDoseDate(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={doseTime}
                onChange={(e) => setDoseTime(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={editingDoseId ? handleUpdateDose : handleRecordDose}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingDoseId ? 'Update' : 'Record'}
              </button>
              <button
                onClick={() => {
                  setIsEditingDose(false);
                  setEditingDoseId(null);
                  setCustomDosage('');
                  setDoseDate('');
                  setDoseTime('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record New Dose Button */}
      {!isEditingDose && (
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
              <h3 className="text-xl font-bold text-gray-900">Drug Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Standard Dose Setting */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Standard Dose
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={standardDoseAmount}
                    onChange={(e) => setStandardDoseAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount"
                    min="0"
                    step="any"
                  />
                  <select
                    value={standardDoseUnit}
                    onChange={(e) => setStandardDoseUnit(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="tablets">tablets</option>
                  </select>
                </div>
                <p className="text-sm text-gray-500">
                  This is your typical dose amount for harm reduction tracking
                </p>
              </div>

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
                  placeholder="Maximum doses per day"
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

              {/* Warning information if available */}
              {drug.warnings && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <label className="text-sm font-medium text-red-700">Important Safety Information</label>
                  </div>
                  <p className="text-red-700 mt-1">{drug.warnings}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpdateSettings}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Dose
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this dose? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteDose}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDoseToDelete(null);
                }}
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