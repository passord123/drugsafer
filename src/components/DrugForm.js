import React, { useState, useMemo } from 'react';
import { Search, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../contexts/AlertContext';
import MobileModal from './layout/MobileModal';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const DrugForm = ({ onAdd, defaultDrugs = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDrugDetails, setShowDrugDetails] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [customDosage, setCustomDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [waitingPeriod, setWaitingPeriod] = useState(4);
  const [maxDailyDoses, setMaxDailyDoses] = useState(4);
  const [initialSupply, setInitialSupply] = useState('0');
  const [formErrors, setFormErrors] = useState({});
  const [enableSupply, setEnableSupply] = useState(false);
  const [currentSupply, setCurrentSupply] = useState('0');
  const [useRecommendedTiming, setUseRecommendedTiming] = useState(true);
  const [recommendedTime, setRecommendedTime] = useState(4);
  const { addAlert } = useAlerts();

  // Get recommended timing information
  const getRecommendedTiming = (drugName, category) => {
    const profile = timingProfiles[drugName.toLowerCase()] || 
                   categoryProfiles[category] || 
                   timingProfiles.default;
    
    const totalMinutes = profile.total();
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    return {
      hours,
      minutes,
      totalMinutes,
      maxDailyDoses: Math.floor(24 * 60 / totalMinutes),
      profile
    };
  };

  // Helper function to get max daily doses from drug config
  const getDefaultMaxDailyDoses = (drugName, category) => {
    // First check drugs.json config
    const drugConfig = defaultDrugs.find(d => 
      d.name.toLowerCase() === drugName.toLowerCase()
    );
    
    if (drugConfig?.settings?.maxDailyDoses) {
      return drugConfig.settings.maxDailyDoses;
    }

    // If no config found, calculate based on timing profile
    const profile = timingProfiles[drugName.toLowerCase()] || 
                   categoryProfiles[category] || 
                   timingProfiles.default;
    
    const totalMinutes = profile.total();
    const hoursPerDose = totalMinutes / 60;
    return Math.floor(24 / hoursPerDose);
  };

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setCustomDosage(drug.dosage || '');
    setDosageUnit(drug.dosageUnit || 'mg');

    // Set max daily doses from configuration
    setMaxDailyDoses(drug.settings?.maxDailyDoses || 
                     getDefaultMaxDailyDoses(drug.name, drug.category));

    // Get timing from profile
    const timing = getRecommendedTiming(drug.name, drug.category);
    setRecommendedTime(timing.totalMinutes / 60);
    
    if (useRecommendedTiming) {
      setWaitingPeriod(timing.totalMinutes / 60);
    } else {
      setWaitingPeriod(drug.settings?.minTimeBetweenDoses || timing.totalMinutes / 60);
    }

    setShowDrugDetails(true);
  };

  const handleAddCustomDrug = () => {
    const customDrug = {
      id: Date.now(),
      name: searchQuery,
      category: 'Custom',
      description: 'Custom substance',
      warnings: "Please research appropriate dosage and safety information for this substance"
    };
    handleDrugSelect(customDrug);
  };

  const resetForm = () => {
    setSelectedDrug(null);
    setCustomDosage('');
    setDosageUnit('mg');
    setWaitingPeriod(4);
    setMaxDailyDoses(4);
    setInitialSupply('0');
    setSearchQuery('');
    setShowDrugDetails(false);
    setFormErrors({});
    setEnableSupply(false);
    setCurrentSupply('0');
    setUseRecommendedTiming(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!customDosage || isNaN(customDosage) || parseFloat(customDosage) <= 0) {
      errors.dosage = 'Please enter a valid dosage amount';
    }
    if (enableSupply && (!currentSupply || isNaN(currentSupply) || parseFloat(currentSupply) < 0)) {
      errors.supply = 'Please enter a valid supply amount';
    }
    return errors;
  };

  const handleAddDrug = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedDrug) return;

    const timing = getRecommendedTiming(selectedDrug.name, selectedDrug.category);

    const drugData = {
      id: Date.now(),
      name: selectedDrug.name,
      category: selectedDrug.category || 'Custom',
      dosage: customDosage,
      dosageUnit: dosageUnit,
      description: selectedDrug.description || '',
      instructions: selectedDrug.instructions || '',
      warnings: selectedDrug.warnings || '',
      dateAdded: new Date().toISOString(),
      doses: [],
      settings: {
        defaultDosage: customDosage,
        defaultDosageUnit: dosageUnit,
        minTimeBetweenDoses: useRecommendedTiming ? timing.totalMinutes / 60 : Number(waitingPeriod),
        maxDailyDoses: Number(maxDailyDoses),
        trackSupply: enableSupply,
        currentSupply: enableSupply ? Number(currentSupply) : null,
        useRecommendedTiming
      }
    };

    onAdd(drugData);
    resetForm();
    addAlert('success', `${selectedDrug.name} added successfully`);
    navigate('/drugs');
  };

  const categories = useMemo(() => {
    const uniqueCats = new Set(defaultDrugs.map(drug => drug.category));
    return ['all', ...Array.from(uniqueCats)];
  }, [defaultDrugs]);

  const filteredDrugs = useMemo(() => {
    return defaultDrugs.filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [defaultDrugs, searchQuery, selectedCategory]);

  return (
    <div className="bg-white h-full">
      <div className="sticky top-0 z-10 bg-white border-b p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search substances..."
            className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-base
                ${selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {filteredDrugs.map(drug => (
          <div
            key={drug.id}
            onClick={() => handleDrugSelect(drug)}
            className="p-4 hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{drug.name}</h3>
                <span className="text-sm text-gray-500">{drug.category}</span>
              </div>

              {drug.instructions && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  {drug.instructions.split('\n').map((line, index) => (
                    <div key={index} className="flex flex-wrap gap-2">
                      {line.split(',').map((dose, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {dose.trim()}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 line-clamp-2">
                {drug.description}
              </p>

              {drug.warnings && (
                <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{drug.warnings}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {searchQuery && filteredDrugs.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No substances found matching your search</p>
            <button
              onClick={handleAddCustomDrug}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg text-lg"
            >
              Add "{searchQuery}"
            </button>
          </div>
        )}
      </div>

      <MobileModal
        isOpen={showDrugDetails}
        onClose={() => {
          setShowDrugDetails(false);
          resetForm();
        }}
        title={selectedDrug?.name || "Add Drug"}
        fullScreen
      >
        <div className="p-4 space-y-6">
          {/* Standard Dose */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Standard Dose
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className="flex-1 input-primary"
                placeholder="Amount"
                min="0"
                step="any"
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
            {formErrors.dosage && (
              <p className="text-sm text-red-600">{formErrors.dosage}</p>
            )}
          </div>

          {/* Hours Between Doses */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useRecommendedTiming}
                onChange={(e) => {
                  setUseRecommendedTiming(e.target.checked);
                  if (e.target.checked && selectedDrug) {
                    const timing = getRecommendedTiming(selectedDrug.name, selectedDrug.category);
                    setWaitingPeriod(timing.totalMinutes / 60);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Recommended Time Between Doses
              </span>
            </label>

            {!useRecommendedTiming && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Time Between Doses (hours)
                </label>
                <input
                  type="number"
                  value={waitingPeriod}
                  onChange={(e) => setWaitingPeriod(Number(e.target.value))}
                  className="w-full input-primary"
                  min="0"
                  step="0.5"
                />
              </div>
            )}
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
            {selectedDrug?.settings?.maxDailyDoses && (
              <p className="text-sm text-blue-600">
                Recommended: max {selectedDrug.settings.maxDailyDoses} doses per day
              </p>
            )}
          </div>

          {/* Supply Tracking */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enableSupply}
                onChange={(e) => setEnableSupply(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Track Supply</span>
            </label>

            {enableSupply && (
              <div className="mt-2">
                <input
                  type="number"
                  value={currentSupply}
                  onChange={(e) => setCurrentSupply(e.target.value)}
                  className="w-full input-primary"
                  min="0"
                  placeholder="Initial supply amount"
                />
                {formErrors.supply && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.supply}</p>
                )}
              </div>
            )}
          </div>

          {/* Safety Information */}
          {selectedDrug?.warnings && (
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-900">Safety Warning</h3>
              </div>
              <p className="text-red-800">{selectedDrug.warnings}</p>
            </div>
          )}
          
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={handleAddDrug}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Drug
          </button>
          <button
            onClick={() => {
              setShowDrugDetails(false);
              resetForm();
            }}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </MobileModal>
    </div>
  );
};

export default DrugForm;