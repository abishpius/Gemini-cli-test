
import React from 'react';
import { Building, QueuedItem, BuildingType } from '../types';
import { BUILDING_DATA } from '../constants';
import ProgressBar from './ProgressBar';

interface VillageDisplayProps {
  buildings: Building[];
  buildQueue: QueuedItem[];
  onSelectBuilding: (type: BuildingType) => void;
}

const VillageDisplay: React.FC<VillageDisplayProps> = ({ buildings, buildQueue, onSelectBuilding }) => {
  const buildingMap = new Map(buildings.map(b => [b.type, b]));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gold">My Village</h2>
      <div className="space-y-3">
        {Object.keys(BUILDING_DATA).map(buildingKey => {
          const buildingType = buildingKey as BuildingType;
          const building = buildingMap.get(buildingType);
          const level = building?.level || 0;
          const data = BUILDING_DATA[buildingType];
          const isConstructing = buildQueue.some(item => item.type === buildingType);

          if (isConstructing) {
            const item = buildQueue.find(item => item.type === buildingType)!;
            return (
              <div key={item.id} className="bg-gray-800/50 p-3 rounded-md animate-pulse-slow border border-yellow-500">
                <p className="font-bold">{data.name} (Lvl {level} -&gt; {item.targetLevel})</p>
                <ProgressBar
                  startTime={item.startTime}
                  finishTime={item.finishTime}
                  label={level > 0 ? 'Upgrading...' : 'Building...'}
                />
              </div>
            );
          }

          return (
            <div 
              key={buildingType} 
              className={`bg-gray-800/50 p-3 rounded-md transition-all duration-200 cursor-pointer hover:bg-gray-700/50 ${level === 0 ? 'opacity-60' : ''}`}
              onClick={() => onSelectBuilding(buildingType)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelectBuilding(buildingType)}
              aria-label={`View details for ${data.name}`}
            >
              <div className="flex justify-between items-center">
                <p className="font-bold">{data.name}</p>
                <p className={`font-bold px-2 py-0.5 rounded text-sm ${level > 0 ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  Lvl {level}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VillageDisplay;