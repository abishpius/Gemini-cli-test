
import React from 'react';
import { Resources, ResourceType } from '../types';
import { ICONS } from '../constants';

interface ResourceDisplayProps {
  resources: Resources;
  population: number;
  populationCap: number;
  resourceCaps: Resources;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, population, populationCap, resourceCaps }) => {

  return (
    <div className="bg-black/50 backdrop-blur-md p-4 rounded-lg border border-gray-700 shadow-lg flex justify-center items-center gap-4 md:gap-8 flex-wrap">
      {Object.entries(resources).map(([resource, amount]) => {
        const Icon = ICONS[resource as ResourceType];
        const cap = resourceCaps[resource as ResourceType];
        const isCapped = amount >= cap;

        return (
          <div key={resource} className="flex items-center space-x-2 text-lg md:text-xl">
            <Icon />
            <span className={`font-bold ${isCapped ? 'text-red-500' : 'text-white'}`}>
              {Math.floor(amount as number)} / {cap}
            </span>
          </div>
        );
      })}
      <div className="flex items-center space-x-2 text-lg md:text-xl" title="Population">
        <span>👨‍👩‍👧‍👦</span>
        <span className="font-bold text-white">{population} / {populationCap}</span>
      </div>
    </div>
  );
};

export default ResourceDisplay;
