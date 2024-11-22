import React from 'react';
import { useNavigate } from 'react-router-dom';
import DrugForm from '../components/DrugForm';
import drugData from '../data/drugs.json';
import { ChevronLeft } from 'lucide-react';

const AddDrugPage = () => {
  const navigate = useNavigate();
  const defaultDrugs = Array.isArray(drugData) ? drugData : [];

  const handleAddDrug = (drug) => {
    // Get existing drugs from localStorage
    const existingDrugs = JSON.parse(localStorage.getItem('drugs') || '[]');

    // Check if the drug already exists in the list
    const existingDrug = existingDrugs.find(d => d.name === drug.name);
    if (existingDrug) {
      // Update the existing drug with the new settings
      const updatedDrugs = existingDrugs.map(d =>
        d.name === drug.name
          ? {
              ...d,
              settings: {
                ...d.settings,
                defaultDosage: drug.settings?.defaultDosage || d.dosage || '0',
                defaultDosageUnit: drug.settings?.defaultDosageUnit || d.dosageUnit || '',
                minTimeBetweenDoses: drug.settings?.minTimeBetweenDoses || 0,
                maxDailyDoses: drug.settings?.maxDailyDoses || 0
              }
            }
          : d
      );
      localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    } else {
      // Create a new drug object with default settings
      const newDrug = {
        id: Date.now(),
        name: drug.name,
        category: drug.category,
        dosage: drug.dosage || '0',
        dosageUnit: drug.dosageUnit || '',
        description: drug.description || '',
        instructions: drug.instructions || '',
        warnings: drug.warnings || '',
        dateAdded: new Date().toISOString(),
        doses: [],
        settings: {
          defaultDosage: drug.settings?.defaultDosage || drug.dosage || '0',
          defaultDosageUnit: drug.settings?.defaultDosageUnit || drug.dosageUnit || '',
          minTimeBetweenDoses: drug.settings?.minTimeBetweenDoses || 0,
          maxDailyDoses: drug.settings?.maxDailyDoses || 0
        }
      };

      const updatedDrugs = [...existingDrugs, newDrug];
      localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    }

    // Navigate back to drugs page
    navigate('/drugs');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Drug</h1>
          <p className="text-gray-600">
            Search our database for your drugs of choice and add them to your tracker
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <DrugForm onAdd={handleAddDrug} defaultDrugs={defaultDrugs} />
      </div>
    </div>
  );
};

export default AddDrugPage;