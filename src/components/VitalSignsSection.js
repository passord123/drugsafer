import React from 'react';
import { HeartPulse, Timer, AlertTriangle } from 'lucide-react';

const VitalSignsSection = ({ drug, currentPhase }) => {
  return (
    <div className="space-y-4">
      {/* Safety Warning */}
      {drug.warnings && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{drug.warnings}</p>
          </div>
        </div>
      )}

      {/* Vital Signs Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
        <h3 className="font-medium text-blue-900">Vital Signs Monitoring</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <HeartPulse className="w-5 h-5 text-blue-500 mt-0.5" />
            <span className="text-sm text-blue-700">Monitor heart rate and breathing rhythm</span>
          </div>
          
          {currentPhase === 'peak' && (
            <div className="flex items-start gap-2">
              <Timer className="w-5 h-5 text-blue-500 mt-0.5" />
              <span className="text-sm text-blue-700">Check temperature regularly during peak effects</span>
            </div>
          )}
          
          {currentPhase === 'peak' && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
              <span className="text-sm text-blue-700">Stay hydrated but don't overdrink</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitalSignsSection;