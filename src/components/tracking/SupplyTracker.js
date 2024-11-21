import React from 'react';
import { Pill } from 'lucide-react';

const SupplyTracker = ({ currentSupply = 0, unit = 'doses' }) => {
  const getSupplyStatus = (amount) => {
    if (amount <= 5) return 'low';
    if (amount <= 10) return 'medium';
    return 'good';
  };

  const supplyStatus = getSupplyStatus(Number(currentSupply));
  const displayUnit = String(unit || 'doses');

  const statusColors = {
    low: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    good: 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <div className={`rounded-lg border p-4 h-full ${statusColors[supplyStatus]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold">Current Supply</h3>
          <p className="text-sm opacity-80">Remaining medication</p>
        </div>
        <Pill className="w-5 h-5" />
      </div>

      <div className="text-center py-4">
        <p className="text-3xl font-bold mb-2">
          {Number(currentSupply)} {displayUnit}
        </p>
        <p className="text-sm opacity-80">
          {supplyStatus === 'low' ? 'Low supply - refill soon' :
           supplyStatus === 'medium' ? 'Medium supply' :
           'Good supply'}
        </p>
      </div>
    </div>
  );
};

export default SupplyTracker;