// src/components/DrugModal.js
import React, { useState } from 'react';

const DrugModal = ({ drug, onClose, onAdd }) => {
  const [userDosage, setUserDosage] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('mg');

  const handleDosageChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) || value === '') {
      setUserDosage(value);
    }
  };

  const handleMeasurementChange = (e) => {
    setMeasurementUnit(e.target.value);
  };

  const handleAddDrug = () => {
    const newDose = {
      timestamp: new Date().toISOString(),
      dosage: `${userDosage} ${measurementUnit}`
    };
    onAdd({ ...drug, doses: [newDose] });
    onClose();
  };

  if (!drug) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content drug-modal">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{drug.name}</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Default Dosage</label>
            <p className="text-gray-900">{drug.dosage}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Enter your dosage</label>
            <div className="input-group">
              <input
                type="text"
                value={userDosage}
                onChange={handleDosageChange}
                placeholder="e.g. 250"
              />
              <select
                value={measurementUnit}
                onChange={handleMeasurementChange}
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          {drug.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-gray-900">{drug.description}</p>
            </div>
          )}

          {drug.recommendedDosage && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Recommended Dosage</label>
              <p className="text-gray-900">{drug.recommendedDosage}</p>
            </div>
          )}
        </div>

        <div className="button-group">
          <button className="primary-btn" onClick={handleAddDrug}>
            Add Medication
          </button>
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugModal;