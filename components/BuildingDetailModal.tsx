
import React, { useState } from 'react';
import { BuildingType, Building, Cost, Troops, TroopType } from '../types';
import { BUILDING_DATA, ICONS, VILLAGER_BUILD_BONUS } from '../constants';
import BuildingInfoScreen from './BuildingInfoScreen';

interface BuildingDetailModalProps {
  buildingType: BuildingType;
  buildings: Building[];
  onClose: () => void;
  onBuildOrUpgrade: (type: BuildingType) => void;
  canAfford: (costs: Cost[]) => boolean;
  troops: Troops;
}

const CostDisplay: React.FC<{ costs: Cost[] }> = ({ costs }) => (
  <div className="flex items-center space-x-4 text-md">
    <span className="font-semibold">Cost:</span>
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


const BuildingDetailModal: React.FC<BuildingDetailModalProps> = ({
  buildingType,
  buildings,
  onClose,
  onBuildOrUpgrade,
  canAfford,
  troops,
}) => {
  const [showInfoScreen, setShowInfoScreen] = useState(false);
  const data = BUILDING_DATA[buildingType];
  const building = buildings.find(b => b.type === buildingType);
  const currentLevel = building?.level || 0;

  const nextLevel = currentLevel + 1;
  const nextLevelCost = data.cost[currentLevel];
  
  const baseBuildTime = data.buildTime[currentLevel];
  const buildTimeReduction = 1 + ((troops[TroopType.Villager] || 0) * VILLAGER_BUILD_BONUS);
  const effectiveBuildTime = baseBuildTime ? Math.round(baseBuildTime / buildTimeReduction) : 0;
  
  const nextLevelProduction = data.production?.amount[currentLevel];
  const nextLevelPopulation = data.population?.[currentLevel];
  const nextLevelStorage = data.storage?.[currentLevel];

  const isMaxLevel = !nextLevelCost;
  const affordable = canAfford(nextLevelCost);

  const actionText = currentLevel === 0 ? 'Build' : `Upgrade to Lvl ${nextLevel}`;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="building-title"
    >
      <div 
        className="bg-gray-900 border border-gold rounded-lg shadow-2xl w-full max-w-md text-white p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {showInfoScreen ? (
          <BuildingInfoScreen 
            buildingType={buildingType} 
            onClose={() => setShowInfoScreen(false)} 
          />
        ) : (
          <>
            <button 
              onClick={onClose} 
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl z-10"
              aria-label="Close"
            >&times;</button>
            
            <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <h2 id="building-title" className="text-3xl font-bold text-gold">{data.name}</h2>
                    <button 
                        onClick={() => setShowInfoScreen(true)}
                        className="text-blue-400 hover:text-blue-300 text-2xl font-bold rounded-full h-8 w-8 flex items-center justify-center bg-gray-700/50"
                        aria-label="View upgrade path"
                        title="View upgrade path"
                    >
                        &#8505;
                    </button>
                </div>
              <p className="text-gray-400 mb-4">{data.description}</p>
              <p className="text-xl font-bold py-1 px-3 bg-blue-600 inline-block rounded-md mb-6">Current Level: {currentLevel}</p>
            </div>
            
            {data.production && currentLevel > 0 && (
              <div className="bg-gray-800/50 p-3 rounded-md mb-2 text-center">
                <p className="font-semibold">Current Production:</p>
                <p className="text-lg">{data.production.amount[currentLevel - 1]} {data.production.resource} / sec</p>
              </div>
            )}

            {data.population && currentLevel > 0 && (
              <div className="bg-gray-800/50 p-3 rounded-md mb-2 text-center">
                <p className="font-semibold">Population Capacity Provided:</p>
                <p className="text-lg">{data.population[currentLevel - 1]}</p>
              </div>
            )}
            
            {data.storage && currentLevel > 0 && (
              <div className="bg-gray-800/50 p-3 rounded-md mb-4 text-center">
                <p className="font-semibold">Resource Capacity Provided:</p>
                <p className="text-lg">{data.storage[currentLevel - 1]}</p>
              </div>
            )}
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              {isMaxLevel ? (
                <p className="text-center text-green-400 font-bold text-lg">Max Level Reached</p>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-center mb-4">Next Level: {nextLevel}</h3>
                  <div className="space-y-3 bg-gray-800/50 p-4 rounded-lg">
                    <CostDisplay costs={nextLevelCost} />
                    <p><span className="font-semibold">Time:</span> {baseBuildTime}s 
                      {troops[TroopType.Villager] > 0 && <span className="text-green-400 text-sm"> ({effectiveBuildTime}s w/ villagers)</span>}
                    </p>
                    {nextLevelProduction !== undefined && data.production && (
                      <p><span className="font-semibold">New Production:</span> {nextLevelProduction} {data.production.resource} / sec</p>
                    )}
                    {nextLevelPopulation !== undefined && (
                      <p><span className="font-semibold">New Population Capacity:</span> {nextLevelPopulation}</p>
                    )}
                    {nextLevelStorage !== undefined && (
                      <p><span className="font-semibold">New Resource Capacity:</span> {nextLevelStorage}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => onBuildOrUpgrade(buildingType)}
                    disabled={!affordable}
                    className={`w-full mt-6 py-3 text-lg font-bold rounded-lg transition-all duration-200 shadow-lg ${
                      affordable
                        ? 'bg-green-700 hover:bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {actionText}
                  </button>
                  {!affordable && <p className="text-center text-red-500 text-sm mt-2">Not enough resources</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildingDetailModal;
