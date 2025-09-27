
import React from 'react';
import { BuildingType, Cost } from '../types';
import { BUILDING_DATA, ICONS } from '../constants';

interface BuildingInfoScreenProps {
  buildingType: BuildingType;
  onClose: () => void;
}

const CostDisplay: React.FC<{ costs: Cost[] | undefined }> = ({ costs }) => {
  if (!costs || costs.length === 0) {
    return <span>-</span>;
  }
  return (
    <div className="flex items-center space-x-2 text-sm flex-wrap gap-y-1">
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
};

const BenefitsDisplay: React.FC<{ levelIndex: number, data: typeof BUILDING_DATA[BuildingType] }> = ({ levelIndex, data }) => {
    const benefits = [];
    if (data.production) {
        benefits.push(`${data.production.amount[levelIndex]} ${data.production.resource}/s`);
    }
    if (data.population) {
        benefits.push(`+${data.population[levelIndex]} Pop Cap`);
    }
    if (data.storage) {
        benefits.push(`${data.storage[levelIndex]} Res Cap`);
    }

    if (benefits.length === 0) {
        return <span>-</span>
    }

    return <>{benefits.join(', ')}</>;
}


const BuildingInfoScreen: React.FC<BuildingInfoScreenProps> = ({ buildingType, onClose }) => {
  const data = BUILDING_DATA[buildingType];
  const maxLevel = data.cost.length;

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gold">{data.name} - Path</h3>
            <button 
              onClick={onClose} 
              className="text-gray-300 hover:text-white text-sm font-bold flex items-center"
              aria-label="Back to details"
            >
                <span className="text-xl">&larr;</span> Back
            </button>
        </div>
      
      <p className="text-gray-400 mb-4 text-sm">{data.description}</p>
      <p className="mb-4 font-semibold">Maximum Level: {maxLevel}</p>

      <div className="max-h-80 overflow-y-auto pr-2">
        <table className="w-full text-left table-auto">
            <thead className="sticky top-0 bg-gray-900 z-10">
                <tr className="border-b border-gray-700">
                    <th className="p-2 text-sm">Lvl</th>
                    <th className="p-2 text-sm">Cost</th>
                    <th className="p-2 text-sm">Benefits</th>
                </tr>
            </thead>
            <tbody className="text-gray-300">
                {Array.from({ length: maxLevel }, (_, i) => {
                    const level = i + 1;
                    const levelCost = data.cost[i];
                    return (
                        <tr key={level} className="border-b border-gray-800">
                            <td className="p-2 font-bold">{level}</td>
                            <td className="p-2"><CostDisplay costs={levelCost} /></td>
                            <td className="p-2 text-sm"><BenefitsDisplay levelIndex={i} data={data} /></td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuildingInfoScreen;
