import React, { useState, useMemo } from 'react';
import { Coordinates, BarbarianVillage, March, Troops, TroopType } from '../types';
import { MAP_SIZE, TROOP_DATA } from '../constants';

interface WorldMapProps {
  playerCoordinates: Coordinates;
  barbarianVillages: BarbarianVillage[];
  marches: March[];
  availableTroops: Troops;
  onLaunchAttack: (target: BarbarianVillage, troops: Troops) => void;
  onClose: () => void;
}

const AttackPanel: React.FC<{
  playerCoordinates: Coordinates;
  target: BarbarianVillage;
  availableTroops: Troops;
  onLaunchAttack: (target: BarbarianVillage, troops: Troops) => void;
  onCancel: () => void;
}> = ({ playerCoordinates, target, availableTroops, onLaunchAttack, onCancel }) => {
  const [attackTroops, setAttackTroops] = useState<Troops>({ Villager: 0, Swordsman: 0, Archer: 0 });

  const handleTroopChange = (type: TroopType, value: string) => {
    const amount = parseInt(value, 10) || 0;
    const max = availableTroops[type] || 0;
    setAttackTroops(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(amount, max)),
    }));
  };
  
  const totalTroopsToSend = Object.values(attackTroops).reduce((s, c) => s + c, 0);
  
  const travelTimeSeconds = useMemo(() => {
    if (totalTroopsToSend === 0) return 0;

    let slowestSpeed = 0; // Find the highest seconds/unit value
    (Object.keys(attackTroops) as TroopType[]).forEach(type => {
        if (attackTroops[type] > 0) {
            const troopSpeed = TROOP_DATA[type].speed;
            if (troopSpeed > slowestSpeed) {
                slowestSpeed = troopSpeed;
            }
        }
    });

    const distance = Math.sqrt(
        Math.pow(playerCoordinates.x - target.coordinates.x, 2) +
        Math.pow(playerCoordinates.y - target.coordinates.y, 2)
    );
    return Math.round(distance * slowestSpeed);
  }, [playerCoordinates, target.coordinates, attackTroops, totalTroopsToSend]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <div className="p-4 bg-gray-800/80 rounded-lg">
      <h3 className="text-xl font-bold text-gold mb-1">Attack Village ({target.coordinates.x}, {target.coordinates.y})</h3>
      <p className="text-lg text-gray-300 font-semibold mb-3">Points: {target.points}</p>
      <p className="text-sm text-gray-400 mb-4">Select troops to send:</p>
      <div className="space-y-3">
        {(Object.keys(availableTroops) as TroopType[]).map(type => (
          <div key={type} className="grid grid-cols-3 items-center gap-2">
            <label htmlFor={`troop_${type}`} className="text-sm font-semibold col-span-1">{TROOP_DATA[type].name} ({availableTroops[type]})</label>
            <input
              type="range"
              id={`troop_slider_${type}`}
              min="0"
              max={availableTroops[type]}
              value={attackTroops[type]}
              onChange={(e) => handleTroopChange(type, e.target.value)}
              className="col-span-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
             <input
              type="number"
              id={`troop_input_${type}`}
              value={attackTroops[type]}
              onChange={(e) => handleTroopChange(type, e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="text-center my-4 p-2 bg-gray-900/50 rounded-md">
        <p className="text-sm text-gray-400">One-way travel time</p>
        <p className="text-lg font-bold text-white">⏱️ {formatTime(travelTimeSeconds)}</p>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => onLaunchAttack(target, attackTroops)}
          disabled={totalTroopsToSend === 0}
          className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Launch Attack
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const WorldMap: React.FC<WorldMapProps> = ({
  playerCoordinates,
  barbarianVillages,
  marches,
  availableTroops,
  onLaunchAttack,
  onClose,
}) => {
  const [selectedVillage, setSelectedVillage] = useState<BarbarianVillage | null>(null);

  const gridStyle = {
    gridTemplateColumns: `repeat(${MAP_SIZE.x}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${MAP_SIZE.y}, minmax(0, 1fr))`,
  };

  const villageMap = useMemo(() => {
    const map = new Map<string, BarbarianVillage>();
    barbarianVillages.forEach(v => map.set(`${v.coordinates.x},${v.coordinates.y}`, v));
    return map;
  }, [barbarianVillages]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex z-50 animate-[fadeIn_0.3s_ease-in-out]"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gold">World Map</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
        </div>
        <div className="flex-1 grid gap-1 p-2 bg-gray-900/50 border border-gray-700 rounded-lg overflow-auto" style={gridStyle}>
          {Array.from({ length: MAP_SIZE.x * MAP_SIZE.y }).map((_, i) => {
            const x = i % MAP_SIZE.x;
            const y = Math.floor(i / MAP_SIZE.x);
            const key = `${x},${y}`;
            const isPlayerHome = playerCoordinates.x === x && playerCoordinates.y === y;
            const isBarbarianHome = villageMap.has(key);

            let content = null;
            if (isPlayerHome) {
              content = <div title="Your Village" className="w-full h-full bg-blue-500 rounded-full animate-pulse-slow"></div>;
            } else if (isBarbarianHome) {
              content = (
                <button
                  title={`Barbarian Village (${x},${y})`}
                  onClick={() => setSelectedVillage(villageMap.get(key)!)}
                  className="w-full h-full bg-red-600 rounded-full hover:scale-125 transition-transform"
                ></button>
              );
            }

            return (
              <div key={key} className="w-full aspect-square bg-gray-800/50 border border-gray-700/50 flex items-center justify-center p-1">
                {content}
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full md:w-96 lg:w-1/3 bg-gray-900/90 p-6 border-l-2 border-gold overflow-y-auto">
        {selectedVillage ? (
          <AttackPanel 
            playerCoordinates={playerCoordinates}
            target={selectedVillage} 
            availableTroops={availableTroops} 
            onLaunchAttack={onLaunchAttack}
            onCancel={() => setSelectedVillage(null)}
          />
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gold">Map Details</h3>
            <p className="text-gray-400 mt-4">Click on a barbarian village to view details and launch an attack.</p>
            <div className="mt-8 space-y-4 text-left">
                <div className="flex items-center"><div className="w-5 h-5 bg-blue-500 rounded-full mr-3"></div> Your Village</div>
                <div className="flex items-center"><div className="w-5 h-5 bg-red-600 rounded-full mr-3"></div> Barbarian Village</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;