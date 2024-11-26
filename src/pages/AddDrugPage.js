import React from 'react';
import { useNavigate } from 'react-router-dom';
import DrugForm from '../components/DrugForm';
import drugData from '../data/drugs.json';
import { ChevronLeft } from 'lucide-react';
import { timingProfiles, categoryProfiles } from '../components/DrugTimer/timingProfiles';

const AddDrugPage = () => {
  const navigate = useNavigate();
  const defaultDrugs = Array.isArray(drugData) ? drugData : [];

  const handleAddDrug = (drug) => {
    // Get existing drugs from localStorage
    const existingDrugs = JSON.parse(localStorage.getItem('drugs') || '[]');

    // Get drug configuration from drugs.json
    const drugConfig = defaultDrugs.find(d => 
      d.name.toLowerCase() === drug.name.toLowerCase()
    );

    // Get timing profile for the drug
    const profile = timingProfiles[drug.name.toLowerCase()] || 
                   categoryProfiles[drug.category] || 
                   timingProfiles.default;
    
    const totalMinutes = profile.total();
    const defaultMinTimeBetweenDoses = totalMinutes / 60;

    // Check if the drug already exists
    const existingDrug = existingDrugs.find(d => d.name === drug.name);
    if (existingDrug) {
      // Update existing drug
      const updatedDrugs = existingDrugs.map(d =>
        d.name === drug.name
          ? {
              ...d,
              settings: {
                ...d.settings,
                defaultDosage: drug.settings?.defaultDosage || drugConfig?.dosage || d.dosage,
                defaultDosageUnit: drug.settings?.defaultDosageUnit || drugConfig?.dosageUnit || d.dosageUnit,
                minTimeBetweenDoses: drug.settings?.useRecommendedTiming 
                  ? defaultMinTimeBetweenDoses 
                  : drug.settings?.minTimeBetweenDoses,
                maxDailyDoses: drugConfig?.settings?.maxDailyDoses || 
                              Math.floor(24 / defaultMinTimeBetweenDoses),
                trackSupply: drug.settings?.trackSupply || false,
                currentSupply: drug.settings?.currentSupply || null,
                useRecommendedTiming: drug.settings?.useRecommendedTiming || true
              }
            }
          : d
      );
      localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    } else {
      // Create new drug
      const newDrug = {
        id: Date.now(),
        name: drug.name,
        category: drugConfig?.category || drug.category,
        dosage: drugConfig?.dosage || drug.dosage,
        dosageUnit: drugConfig?.dosageUnit || drug.dosageUnit,
        description: drugConfig?.description || drug.description,
        instructions: drugConfig?.instructions || drug.instructions,
        warnings: drugConfig?.warnings || drug.warnings,
        dateAdded: new Date().toISOString(),
        doses: [],
        settings: {
          defaultDosage: drug.settings?.defaultDosage || drugConfig?.dosage,
          defaultDosageUnit: drug.settings?.defaultDosageUnit || drugConfig?.dosageUnit,
          minTimeBetweenDoses: drug.settings?.useRecommendedTiming 
            ? defaultMinTimeBetweenDoses 
            : drug.settings?.minTimeBetweenDoses,
          maxDailyDoses: drugConfig?.settings?.maxDailyDoses || 
                        Math.floor(24 / defaultMinTimeBetweenDoses),
          trackSupply: drug.settings?.trackSupply || false,
          currentSupply: drug.settings?.currentSupply || null,
          useRecommendedTiming: drug.settings?.useRecommendedTiming || true
        }
      };

      const updatedDrugs = [...existingDrugs, newDrug];
      localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    }

    navigate('/drugs');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Drug</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search our database for your drugs of choice and add them to your tracker
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <DrugForm onAdd={handleAddDrug} defaultDrugs={defaultDrugs} />
      </div>
    </div>
  );
};

export default AddDrugPage;