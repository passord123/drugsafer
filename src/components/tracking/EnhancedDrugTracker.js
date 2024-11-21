import React, { useState, useEffect } from 'react';
import { Clock, Settings, AlertTriangle, PlusCircle, Calendar, CheckCircle } from 'lucide-react';
import Progress from './Progress';
import Alert from './Alert';
import Dialog from './Dialog';

const EnhancedDrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingDose, setIsEditingDose] = useState(false);
  const [customDosage, setCustomDosage] = useState(
    drug.settings?.defaultDosage?.amount || ''
  );
  const [dosageUnit, setDosageUnit] = useState(
    drug.settings?.defaultDosage?.unit || 'mg'
  );
  const [nextDoseTime, setNextDoseTime] = useState(null);

  // Calculate adherence rate
  const calculateAdherence = () => {
    if (!drug.doses?.length) return 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDoses = drug.doses.filter(dose => 
      new Date(dose.timestamp) > thirtyDaysAgo
    ).length;
    
    const expectedDoses = 30 * (24 / drug.settings.minTimeBetweenDoses);
    return Math.min(100, (recentDoses / expectedDoses) * 100);
  };

  // Update next dose time
  useEffect(() => {
    if (!drug.doses?.[0]) {
      setNextDoseTime(new Date());
      return;
    }
    
    const lastDoseTime = new Date(drug.doses[0].timestamp);
    const nextTime = new Date(
      lastDoseTime.getTime() + 
      (drug.settings.minTimeBetweenDoses * 60 * 60 * 1000)
    );
    setNextDoseTime(nextTime);
  }, [drug.doses, drug.settings.minTimeBetweenDoses]);

  const handleRecordDose = () => {
    const updatedSupply = Math.max(0, (drug.settings?.currentSupply || 0) - 1);
    onRecordDose(drug.id, `${customDosage} ${dosageUnit}`, updatedSupply);
    setIsEditingDose(false);
    setCustomDosage('');
  };

  const adherenceRate = calculateAdherence();
  const isLowSupply = drug.settings?.currentSupply <= 5;

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

      {/* Adherence Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">30-Day Adherence</h3>
          <span className="text-sm text-gray-500">{adherenceRate.toFixed(1)}%</span>
        </div>
        <Progress value={adherenceRate} />
      </div>

      {/* Next Dose Timer */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-medium text-blue-900">Next Dose Due</h3>
            <p className="text-sm text-blue-700">
              {nextDoseTime > new Date() 
                ? nextDoseTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : 'Ready for next dose'}
            </p>
          </div>
        </div>
      </div>

      {/* Supply Warning */}
      {isLowSupply && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Low supply warning: {drug.settings.currentSupply} {drug.settings.defaultDosage.unit} remaining
          </span>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">This Month</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {drug.doses?.filter(dose => {
              const doseDate = new Date(dose.timestamp);
              const today = new Date();
              return doseDate.getMonth() === today.getMonth();
            }).length || 0} doses
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Streak</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {drug.doses?.reduce((streak, dose, index, doses) => {
              if (index === 0) return 1;
              const current = new Date(dose.timestamp);
              const prev = new Date(doses[index - 1].timestamp);
              return current.getDate() - prev.getDate() === 1 ? streak + 1 : streak;
            }, 0) || 0} days
          </p>
        </div>
      </div>

      {/* Record Dose Button/Form */}
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

      {/* Settings Dialog */}
      <Dialog 
        open={showSettings} 
        onClose={() => setShowSettings(false)}
        title="Medication Settings"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Daily Doses</label>
            <input
              type="number"
              value={drug.settings?.maxDailyDoses}
              onChange={(e) => onUpdateSettings(drug.id, {
                ...drug.settings,
                maxDailyDoses: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hours Between Doses</label>
            <input
              type="number"
              value={drug.settings?.minTimeBetweenDoses}
              onChange={(e) => onUpdateSettings(drug.id, {
                ...drug.settings,
                minTimeBetweenDoses: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Supply</label>
            <input
              type="number"
              value={drug.settings?.currentSupply}
              onChange={(e) => onUpdateSettings(drug.id, {
                ...drug.settings,
                currentSupply: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default EnhancedDrugTracker;