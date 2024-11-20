// src/pages/AddDrugPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DrugForm from '../components/DrugForm';
import drugData from '../data/drugs.json';
import { ChevronLeft } from 'lucide-react';

const AddDrugPage = () => {
  const navigate = useNavigate();
  const defaultDrugs = Array.isArray(drugData) ? drugData : [];

  const handleAddDrug = (drug) => {
    const existingDrugs = JSON.parse(localStorage.getItem('drugs') || '[]');
    const updatedDrugs = [...existingDrugs, {
      ...drug,
      doses: [],
      dateAdded: new Date().toISOString(),
      settings: {
        defaultDosage: drug.dosage,
        defaultDosageUnit: drug.dosageUnit || 'mg',
        minTimeBetweenDoses: drug.minTimeBetweenDoses || 4,
        maxDailyDoses: drug.maxDailyDoses || 4,
      }
    }];
    
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Medication</h1>
          <p className="text-gray-600">
            Search our database or add a custom medication to your tracker
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <DrugForm
          onAdd={handleAddDrug}
          defaultDrugs={defaultDrugs}
        />
      </div>
    </div>
  );
};

export default AddDrugPage;