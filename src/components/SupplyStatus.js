import React from 'react';
import { Package } from 'lucide-react';

const SupplyStatus = ({ drug }) => {
  if (!drug.settings?.trackSupply) return null;

  return (
    <div className={`p-4 rounded-lg border ${
      drug.settings?.currentSupply <= 0 ? 'bg-red-50 border-red-200' :
      drug.settings?.currentSupply <= 5 ? 'bg-yellow-50 border-yellow-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Current Supply</h3>
            <p className="text-sm mt-1">
              {drug.settings.currentSupply || 0} {drug.settings?.defaultDosageUnit || drug.dosageUnit} remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyStatus;