import React, { useState, useEffect } from 'react';
import { Clock, Settings, X, PlusCircle, Pencil, Trash2, AlertCircle, Package } from 'lucide-react';
import MobileModal from './layout/MobileModal';
import SupplyTracker from './tracking/SupplyTracker';
import WarningSystem from './tracking/WarningSystem';

const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingDose, setIsEditingDose] = useState(false);
  const [editingDoseId, setEditingDoseId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doseToDelete, setDoseToDelete] = useState(null);
  const [customDosage, setCustomDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState(drug.settings?.defaultDosageUnit || 'mg');
  const [doseDate, setDoseDate] = useState('');
  const [doseTime, setDoseTime] = useState('');
  const [standardDoseAmount, setStandardDoseAmount] = useState(
    drug.settings?.defaultDosage?.amount || drug.settings?.defaultDosage || ''
  );
  const [standardDoseUnit, setStandardDoseUnit] = useState(
    drug.settings?.defaultDosage?.unit || drug.settings?.defaultDosageUnit || 'mg'
  );
  const [maxDailyDoses, setMaxDailyDoses] = useState(drug.settings?.maxDailyDoses || 4);
  const [waitingPeriod, setWaitingPeriod] = useState(drug.settings?.minTimeBetweenDoses || 4);
  const [supplyAmount, setSupplyAmount] = useState(drug.settings?.currentSupply || 0);
  const [features, setFeatures] = useState(drug.settings?.features || {
    supplyManagement: true,
    dailyLimits: true,
    timingRestrictions: true
  });
  const resetForm = () => {
    setCustomDosage('');
    setDosageUnit(drug.settings?.defaultDosageUnit || 'mg');
    setStandardDoseAmount(drug.settings?.defaultDosage?.amount || '');
    setStandardDoseUnit(drug.settings?.defaultDosage?.unit || 'mg');
    setMaxDailyDoses(drug.settings?.maxDailyDoses || 4);
    setWaitingPeriod(drug.settings?.minTimeBetweenDoses || 4);
    setSupplyAmount(drug.settings?.currentSupply || 0);
    setFeatures(drug.settings?.features || {
      supplyManagement: true, 
      dailyLimits: true,
      timingRestrictions: true
    });
    setDoseDate('');
    setDoseTime('');
    setIsEditingDose(false); 
    setEditingDoseId(null);
    setShowSettings(false);
  };

  useEffect(() => {
    const now = new Date();
    setDoseDate(now.toISOString().split('T')[0]);
    setDoseTime(now.toTimeString().slice(0, 5));
    setCustomDosage(drug.settings?.defaultDosage?.amount || '');
    setDosageUnit(drug.settings?.defaultDosage?.unit || 'mg');
  }, [drug, isEditingDose]);

  useEffect(() => {
    resetForm();
  }, [drug]);


  const handleEditDose = (dose) => {
    setEditingDoseId(dose.id);
    setIsEditingDose(true);
    const [amount, unit] = dose.dosage.split(' ');
    setCustomDosage(amount);
    setDosageUnit(unit);
    const date = new Date(dose.timestamp);
    setDoseDate(date.toISOString().split('T')[0]);
    setDoseTime(date.toTimeString().slice(0, 5));
  };

  const handleUpdateDose = () => {
    if (!customDosage || customDosage <= 0) {
      alert('Please enter a valid dosage amount');
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
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    onUpdateSettings(drug.id, { ...drug, doses: updatedDoses });
    setIsEditingDose(false);
    setEditingDoseId(null);
    resetForm();
  };

  const handleRecordDose = () => {
    if (!customDosage || customDosage <= 0) {
      alert('Please enter a valid dosage amount');
      return;
    }

    const timestamp = new Date(`${doseDate}T${doseTime}`);
    if (isNaN(timestamp.getTime())) {
      alert('Invalid date or time');
      return;
    }

    if (features.dailyLimits && getTodaysDoses() >= maxDailyDoses) {
      alert('Maximum daily doses reached');
      return;
    }

    const updatedSupply = features.supplyManagement
    ? Math.max(0, Number(supplyAmount) - Number(customDosage))
    : drug.settings?.currentSupply || 0;

    const newDose = {
      id: Date.now(),
      timestamp: timestamp.toISOString(),
      dosage: `${customDosage} ${dosageUnit}`,
      status: calculateDoseStatus(timestamp.toISOString(), drug.doses?.[0]?.timestamp)
    };

    const updatedDrug = {
      ...drug,
      doses: [newDose, ...(drug.doses || [])].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      ),
      settings: {
        ...drug.settings,
        currentSupply: updatedSupply
      }
    };

    onUpdateSettings(drug.id, updatedDrug);
    onRecordDose(drug.id, `${customDosage} ${dosageUnit}`, updatedSupply);
    setIsEditingDose(false);
    resetForm();
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

  const handleUpdateSettings = () => {
    if (!standardDoseAmount || standardDoseAmount <= 0) {
      alert('Please enter a valid standard dose amount');
      return;
    }

    onUpdateSettings(drug.id, {
      ...drug,
      settings: {
        ...drug.settings,
        defaultDosage: {
          amount: standardDoseAmount,
          unit: standardDoseUnit
        },
        features,
        maxDailyDoses: Number(maxDailyDoses),
        minTimeBetweenDoses: Number(waitingPeriod),
        currentSupply: Number(supplyAmount)
      }
    });
    setShowSettings(false);
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
    const hoursBetween = (new Date(doseTime) - new Date(previousDoseTime)) / (1000 * 60 * 60);
    if (hoursBetween < waitingPeriod / 2) return 'early';
    if (hoursBetween < waitingPeriod) return 'warning';
    return 'normal';
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="p-4 space-y-6">
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
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {features.timingRestrictions && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-blue-900">Next Dose</h3>
                  <p className="text-sm text-blue-700">
                    {drug.doses?.[0] ? getTimeUntilNextDose() : 'No doses recorded'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {features.supplyManagement && (
            <SupplyTracker
              currentSupply={Number(drug.settings?.currentSupply || 0)}
              unit={drug.settings?.defaultDosage?.unit || dosageUnit}
            />
          )}
        </div>

        {/* Recent Doses */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Recent Doses</h3>
            <button
              onClick={() => setIsEditingDose(true)}
              className="flex items-center gap-2 text-blue-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Add Dose</span>
            </button>
          </div>

          <div className="divide-y max-h-[300px] overflow-y-auto">
            {drug.doses?.map(dose => (
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
                      className="p-2 text-gray-400 hover:text-blue-500"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDoseToDelete(dose.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!drug.doses?.length && (
              <div className="p-8 text-center text-gray-500">
                No doses recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Warning System */}
        {drug.warnings && (
          <WarningSystem
            medication={drug}
            lastDose={drug.doses?.[0]}
            dailyDoses={getTodaysDoses()}
          />
        )}
      </div>

      {/* Settings Modal */}
      <MobileModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Drug Settings"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Standard Dose</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 input-primary"
                value={standardDoseAmount}
                onChange={(e) => setStandardDoseAmount(e.target.value)}
                min="0"
                step="any"
              />
              <select
                value={standardDoseUnit}
                onChange={(e) => setStandardDoseUnit(e.target.value)}
                className="w-24 input-primary"
              >
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="tablets">tablets</option>
              </select>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Daily Limits</label>
              <input
                type="checkbox"
                checked={features.dailyLimits}
                onChange={(e) => setFeatures(prev => ({
                  ...prev,
                  dailyLimits: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
            </div>
            {features.dailyLimits && (
              <input
                type="number"
                value={maxDailyDoses}
                onChange={(e) => setMaxDailyDoses(e.target.value)}
                className="w-full input-primary"
                min="1"
                placeholder="Maximum doses per day"
              />
            )}

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Timing Restrictions</label>
              <input
                type="checkbox"
                checked={features.timingRestrictions}
                onChange={(e) => setFeatures(prev => ({
                  ...prev,
                  timingRestrictions: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
            </div>
            {features.timingRestrictions && (
              <input
                type="number"
                value={waitingPeriod}
                onChange={(e) => setWaitingPeriod(e.target.value)}
                className="w-full input-primary"
                min="0"
                step="0.5"
                placeholder="Hours between doses"
              />
            )}

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Supply Management</label>
              <input
                type="checkbox"
                checked={features.supplyManagement}
                onChange={(e) => setFeatures(prev => ({
                  ...prev,
                  supplyManagement: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
            </div>
            {features.supplyManagement && (
              <input
                type="number"
                value={supplyAmount}
                onChange={(e) => setSupplyAmount(e.target.value)}
                className="w-full input-primary"
                min="0"
                placeholder="Current supply"
              />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={handleUpdateSettings}
            className="flex-1 btn-primary">
            Save Changes
          </button>
          <button
            onClick={() => setShowSettings(false)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </MobileModal>

      {/* Dose Form Modal */}
      <MobileModal
        isOpen={isEditingDose}
        onClose={() => {
          setIsEditingDose(false);
          setEditingDoseId(null);
          resetForm();
        }}
        title={editingDoseId ? "Edit Dose" : "Record Dose"}
      >
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              value={customDosage}
              onChange={(e) => setCustomDosage(e.target.value)}
              className="flex-1 input-primary"
              placeholder="Amount"
            />
            <select
              value={dosageUnit}
              onChange={(e) => setDosageUnit(e.target.value)}
              className="w-24 input-primary"
            >
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="g">g</option>
              <option value="tablets">tablets</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={doseDate}
              onChange={(e) => setDoseDate(e.target.value)}
              className="input-primary"
            />
            <input
              type="time"
              value={doseTime}
              onChange={(e) => setDoseTime(e.target.value)}
              className="input-primary"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={editingDoseId ? handleUpdateDose : handleRecordDose}
            className="flex-1 btn-primary"
          >
            {editingDoseId ? 'Update' : 'Record'}
          </button>
          <button
            onClick={() => {
              setIsEditingDose(false);
              setEditingDoseId(null);
              resetForm();
            }}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </MobileModal>

      {/* Delete Confirmation */}
      <MobileModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDoseToDelete(null);
        }}
        title="Delete Dose"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this dose? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const updatedDoses = drug.doses.filter(dose => dose.id !== doseToDelete);
                onUpdateSettings(drug.id, { ...drug, doses: updatedDoses });
                setShowDeleteConfirm(false);
                setDoseToDelete(null);
              }}
              className="flex-1 btn-primary bg-red-500 hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDoseToDelete(null);
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileModal>
    </div>
  );
};

export default DrugTracker;