import React, { useState } from 'react';
import { TroopType, Cost, Building, Troops, Resources, BuildingType } from '../types';
import { BUILDING_DATA, TROOP_DATA, ICONS } from '../constants';

interface ActionPanelProps {
  onTrain: (type: TroopType, amount: number) => void;
  canAfford: (costs: Cost[]) => boolean;
  buildings: Building[];
  troops: Troops;
  population: number;
  populationCap: number;
  onSelectTroopInfo: (type: TroopType) => void;
  resources: Resources;
}

const CostDisplay: React.FC<{ costs: Cost[] }> = ({ costs }) => (
  <div className="flex items-center space-x-3 text-sm">
    {costs.map(cost => {
      const Icon = ICONS[cost.resource];
      return (
        <div key={cost.resource} className="flex items-center">
          <Icon /> <span className="ml-1">{cost.amount}</span>
        </div>
      );
    })}
  </div>
);

const ActionPanel: React.FC<ActionPanelProps> = ({ onTrain, buildings, population, populationCap, onSelectTroopInfo, resources }) => {
  const [trainAmounts, setTrainAmounts] = useState<Partial<Record<TroopType, number>>>({});

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gold">Actions</h2>
      
      <div>
        <h3 className="text-xl font-semibold mb-3 text-gray-300 border-b border-gray-600 pb-2">Train Troops</h3>
        <div className="space-y-4">
          {Object.entries(TROOP_DATA).map(([key, data]) => {
            const type = key as TroopType;
            const requiredBuildingExists = buildings.some(b => b.type === data.requiredBuilding);

            let maxAffordable = Infinity;
            if (data.cost.length > 0) {
              data.cost.forEach(cost => {
                const maxForRes = Math.floor(resources[cost.resource] / cost.amount);
                if (maxForRes < maxAffordable) {
                  maxAffordable = maxForRes;
                }
              });
            } else {
              maxAffordable = Infinity; // For free units if any
            }
            
            const maxByPopulation = populationCap - population;
            const maxTrainable = Math.max(0, Math.min(maxAffordable, maxByPopulation));

            const handleAmountChange = (value: string) => {
              let num = parseInt(value, 10);
              if (isNaN(num)) num = 0;
              const clampedNum = Math.max(0, Math.min(num, maxTrainable));
              setTrainAmounts(prev => ({...prev, [type]: clampedNum}));
            }

            const currentAmount = trainAmounts[type] || 0;

            const handleTrainClick = () => {
              if (currentAmount > 0) {
                onTrain(type, currentAmount);
                setTrainAmounts(prev => ({...prev, [type]: 0}));
              }
            }
            
            let tooltipText = "";
            if (!requiredBuildingExists) tooltipText = `Requires ${BUILDING_DATA[data.requiredBuilding].name}`;
            else if (maxByPopulation <= 0) tooltipText = "Population capacity reached.";
            else if (maxAffordable <= 0) tooltipText = "Not enough resources.";

            const barracks = buildings.find(b => b.type === BuildingType.Barracks);
            const barracksLevel = barracks?.level || 0;
            const barracksData = BUILDING_DATA.Barracks;
            let effectiveTrainTime = data.trainTime;
            let reductionPercent = 0;

            if (barracksLevel > 0 && barracksData.trainTimeReduction) {
                const reduction = barracksData.trainTimeReduction[barracksLevel - 1] || 0;
                effectiveTrainTime = Math.round(data.trainTime * (1 - reduction));
                reductionPercent = Math.round(reduction * 100);
            }

            return (
              <div key={type} className="bg-gray-800/50 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{data.name}</p>
                      <button 
                          onClick={() => onSelectTroopInfo(type)}
                          className="text-blue-400 hover:text-blue-300 text-lg font-bold rounded-full h-6 w-6 flex items-center justify-center bg-gray-700/50"
                          aria-label={`View info for ${data.name}`}
                          title={`View info for ${data.name}`}
                      >
                          &#8505;
                      </button>
                    </div>
                     <p className="text-xs text-gray-400 mt-1" title={reductionPercent > 0 ? `Base: ${data.trainTime}s` : undefined}>
                        Time: {effectiveTrainTime}s / unit
                        {reductionPercent > 0 && <span className="text-green-400 ml-1">(-{reductionPercent}%)</span>}
                    </p>
                  </div>
                  <CostDisplay costs={data.cost} />
                </div>
                
                <div className="mt-3">
                  {requiredBuildingExists ? (
                     <>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max={maxTrainable}
                            value={currentAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                            disabled={maxTrainable === 0}
                          />
                          <input
                            type="number"
                            value={currentAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-20 bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-sm text-center disabled:opacity-50"
                            disabled={maxTrainable === 0}
                            min="0"
                            max={maxTrainable}
                          />
                        </div>
                        <button
                          onClick={handleTrainClick}
                          disabled={currentAmount === 0}
                          className={`w-full mt-2 px-4 py-2 text-sm font-bold rounded transition-all duration-200 ${
                            currentAmount === 0
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-green-700 hover:bg-green-600 text-white shadow-md'
                          }`}
                        >
                          Train {currentAmount > 0 ? currentAmount : ''}
                        </button>
                        {maxTrainable === 0 && tooltipText && (
                            <p className="text-xs text-center text-red-500 mt-1">{tooltipText}</p>
                        )}
                      </>
                  ) : (
                    <div className="text-center p-2 bg-yellow-900/50 rounded-md">
                        <p className="text-xs text-yellow-400 font-semibold">{`Requires ${BUILDING_DATA[data.requiredBuilding].name}`}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;