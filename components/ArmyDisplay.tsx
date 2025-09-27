import React from 'react';
import { Troops, QueuedItem, TroopType, March, MarchStatus } from '../types';
import { TROOP_DATA } from '../constants';
import ProgressBar from './ProgressBar';

interface ArmyDisplayProps {
  troops: Troops;
  trainQueue: QueuedItem[];
  marches: March[];
}

const ArmyDisplay: React.FC<ArmyDisplayProps> = ({ troops, trainQueue, marches }) => {
  const currentTrainingItem = trainQueue.length > 0 ? trainQueue[0] : null;
  const queuedSummary: Partial<Record<TroopType, number>> = {};

  if (trainQueue.length > 1) {
    trainQueue.slice(1).forEach(item => {
      const type = item.type as TroopType;
      queuedSummary[type] = (queuedSummary[type] || 0) + 1;
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gold">My Army</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {Object.entries(troops).map(([type, count]) => {
          if (count === 0) return null;
          const data = TROOP_DATA[type as TroopType];
          return (
            <div key={type} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center">
              <p className="font-bold">{data.name}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          );
        })}
        
        {Object.values(troops).every(c => c === 0) && (
            <p className="text-gray-400">You have no troops at home.</p>
        )}

        {currentTrainingItem && (
          <div key={currentTrainingItem.id} className="bg-gray-800/50 p-3 rounded-md animate-pulse-slow">
            <p className="font-bold">{TROOP_DATA[currentTrainingItem.type as TroopType].name} (Training)</p>
            <ProgressBar
              startTime={currentTrainingItem.startTime}
              finishTime={currentTrainingItem.finishTime}
              label="Training..."
            />
          </div>
        )}

        {Object.keys(queuedSummary).length > 0 && (
          <div className="bg-gray-800/50 p-3 rounded-md text-sm mt-2">
            <p className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">In Queue:</p>
            <div className="space-y-1 mt-2">
              {Object.entries(queuedSummary).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-300">{TROOP_DATA[type as TroopType].name}</span>
                  <span className="font-semibold text-white">x {count}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {marches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-300">Marches</h3>
            {marches.map((march) => {
              const isReturning = march.status === MarchStatus.Returning;
              
              const totalSurvivingTroops = Object.values(march.troops).reduce((sum, count) => sum + count, 0);
              if (isReturning && totalSurvivingTroops === 0) {
                return null; // Don't show a return march for a defeated army
              }
              
              const startTime = isReturning ? march.arrivalTime : march.startTime;
              const finishTime = isReturning ? march.returnTime : march.arrivalTime;
              const label = isReturning 
                ? `Returning from (${march.target.x}, ${march.target.y})` 
                : `Attacking (${march.target.x}, ${march.target.y})`;

              return (
                <div key={march.id} className="bg-gray-800/50 p-3 rounded-md animate-pulse-slow mb-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">{label}</p>
                    <div className="flex space-x-2 text-xs">
                      {Object.entries(march.troops).map(([type, count]) => count > 0 && (
                        <span key={type}>{TROOP_DATA[type as TroopType].name.substring(0,1)}: {count}</span>
                      ))}
                    </div>
                  </div>
                  <ProgressBar
                    startTime={startTime}
                    finishTime={finishTime}
                    label={isReturning ? 'Returning...' : 'Marching...'}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArmyDisplay;
