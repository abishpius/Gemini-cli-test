import React from 'react';
import { TroopType, Cost } from '../types';
import { TROOP_DATA, ICONS } from '../constants';

interface TroopDetailModalProps {
  troopType: TroopType;
  onClose: () => void;
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

const StatDisplay: React.FC<{ label: string; value: number | string, icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
        <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <span className="font-semibold">{label}</span>
        </div>
        <span className="text-xl font-bold">{value}</span>
    </div>
);


const TroopDetailModal: React.FC<TroopDetailModalProps> = ({ troopType, onClose }) => {
  const data = TROOP_DATA[troopType];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="troop-title"
    >
      <div 
        className="bg-gray-900 border border-gold rounded-lg shadow-2xl w-full max-w-sm text-white p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl z-10"
          aria-label="Close"
        >&times;</button>
        
        <div className="text-center mb-6">
          <h2 id="troop-title" className="text-3xl font-bold text-gold">{data.name}</h2>
          <p className="text-gray-400 mt-2">{data.description}</p>
        </div>
        
        <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
                <CostDisplay costs={data.cost} />
            </div>

            <h3 className="text-xl font-semibold text-center pt-4 border-t border-gray-700">Stats</h3>
            <div className="space-y-2">
                <StatDisplay label="Attack" value={data.attack} icon="⚔️" />
                <StatDisplay label="Defense" value={data.defense} icon="🛡️" />
                <StatDisplay label="Loot Capacity" value={data.carry} icon="💰" />
                <StatDisplay label="Travel Speed" value={`${data.speed}s/sq`} icon="🏃" />
                <StatDisplay label="Training Time" value={`${data.trainTime}s`} icon="⏱️" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default TroopDetailModal;