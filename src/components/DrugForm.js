import React, { useState, useMemo } from 'react';
import { Search, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../contexts/AlertContext';
import MobileModal from './modals/MobileModal';
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

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setCustomDosage(drug.dosage || '');
    setDosageUnit(drug.dosageUnit || 'mg');

    const timing = getRecommendedTiming(drug.name, drug.category);
    setRecommendedTime(timing.totalMinutes / 60);
    
    if (useRecommendedTiming) {
      setWaitingPeriod(timing.totalMinutes / 60);
    }

    setMaxDailyDoses(drug.settings?.maxDailyDoses || 
      Math.floor(24 * 60 / timing.totalMinutes));

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
    addAlert('Drug added successfully', 'success');
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
    <div className="bg-white dark:bg-gray-800 h-full">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search substances..."
            className="w-full pl-10 pr-10 py-3 border dark:border-gray-600 rounded-lg text-lg
                     bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500
                       hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-base
                ${selectedCategory === category
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Drug List */}
      <div className="divide-y dark:divide-gray-700">
        {filteredDrugs.map(drug => (
          <div
            key={drug.id}
            onClick={() => handleDrugSelect(drug)}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{drug.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{drug.category}</span>
              </div>

              {drug.instructions && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg space-y-1">
                  {drug.instructions.split('\n').map((line, index) => (
                    <div key={index} className="flex flex-wrap gap-2">
                      {line.split(',').map((dose, i) => (
                        <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                                             px-2 py-1 rounded text-sm">
                          {dose.trim()}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {drug.description}
              </p>

              {drug.warnings && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{drug.warnings}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* No Results */}
        {searchQuery && filteredDrugs.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No substances found matching your search
            </p>
            <button
              onClick={handleAddCustomDrug}
              className="inline-flex items-center px-6 py-3 bg-blue-500 dark:bg-blue-600 
                       hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-lg"
            >
              Add "{searchQuery}"
            </button>
          </div>
        )}
      </div>

      {/* Drug Details Modal */}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Standard Dose
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 
                         border border-gray-300 dark:border-gray-600
                         rounded-lg text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Amount"
                min="0"
                step="any"
              />
              <select
                value={dosageUnit}
                onChange={(e) => setDosageUnit(e.target.value)}
                className="w-24 px-3 py-2 bg-white dark:bg-gray-700
                         border border-gray-300 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white"
              >
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="tablets">tablets</option>
              </select>
            </div>
            {formErrors.dosage && (
              <p className="text-sm text-red-600 dark:text-red-400">{formErrors.dosage}</p>
            )}
          </div>

          {/* Time Between Doses */}
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
                className="rounded border-gray-300 dark:border-gray-600 
                         text-blue-600 dark:text-blue-400
                         focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Use Recommended Time Between Doses
              </span>
            </label>

            {!useRecommendedTiming && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Time Between Doses (hours)
                </label>
                <input
                  type="number"
                  value={waitingPeriod}
                  onChange={(e) => setWaitingPeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700
                           border border-gray-300 dark:border-gray-600
                           rounded-lg text-gray-900 dark:text-white"
                  min="0"
                  step="0.5"/>
                  </div>
                )}
              </div>
    
              {/* Max Daily Doses */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Doses per Day
                </label>
                <input
                  type="number"
                  value={maxDailyDoses}
                  onChange={(e) => setMaxDailyDoses(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700
                           border border-gray-300 dark:border-gray-600
                           rounded-lg text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  min="1"
                />
                {selectedDrug?.settings?.maxDailyDoses && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
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
                    className="rounded border-gray-300 dark:border-gray-600 
                             text-blue-600 dark:text-blue-400
                             focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Track Supply
                  </span>
                </label>
    
                {enableSupply && (
                  <div className="mt-2">
                    <input
                      type="number"
                      value={currentSupply}
                      onChange={(e) => setCurrentSupply(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700
                               border border-gray-300 dark:border-gray-600
                               rounded-lg text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      min="0"
                      placeholder="Initial supply amount"
                    />
                    {formErrors.supply && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {formErrors.supply}
                      </p>
                    )}
                  </div>
                )}
              </div>
    
              {/* Safety Information */}
              {selectedDrug?.warnings && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                    <h3 className="font-medium text-red-900 dark:text-red-300">Safety Warning</h3>
                  </div>
                  <p className="text-red-800 dark:text-red-200">{selectedDrug.warnings}</p>
                </div>
              )}
            </div>
    
            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex gap-2">
              <button
                onClick={handleAddDrug}
                className="flex-1 px-4 py-2 bg-blue-500 dark:bg-blue-600 
                         hover:bg-blue-600 dark:hover:bg-blue-700 
                         text-white rounded-lg transition-colors"
              >
                Add Drug
              </button>
              <button
                onClick={() => {
                  setShowDrugDetails(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </MobileModal>
        </div>
      );
    };
    
    export default DrugForm;