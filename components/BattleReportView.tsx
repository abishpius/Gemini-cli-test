import React from 'react';
import { BattleReport, Troops, TroopType, ResourceType, Building } from '../types';
import { TROOP_DATA, ICONS, BUILDING_DATA } from '../constants';

interface BattleReportViewProps {
  report: BattleReport;
  onBack: () => void;
}

const TroopBreakdown: React.FC<{ title: string, initial: Troops, losses: Troops }> = ({ title, initial, losses }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg flex-1">
        <h3 className="text-xl font-bold text-center mb-3 text-gold">{title}</h3>
        <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-400 border-b border-gray-600 pb-1">
                <span>Unit</span>
                <span className="text-center">Start</span>
                <span className="text-center">Lost</span>
                <span className="text-center">End</span>
            </div>
            {(Object.keys(initial) as TroopType[]).map(type => {
                if (initial[type] === 0 && (losses[type] === 0 || !losses[type])) return null;
                const data = TROOP_DATA[type];
                const initialCount = initial[type] || 0;
                const lossCount = losses[type] || 0;
                const survivorCount = initialCount - lossCount;
                return (
                    <div key={type} className="grid grid-cols-4 gap-2 items-center">
                        <span>{data.name}</span>
                        <span className="text-center">{initialCount}</span>
                        <span className="text-center text-red-500">{lossCount > 0 ? `-${lossCount}` : 0}</span>
                        <span className="text-center font-bold">{survivorCount}</span>
                    </div>
                )
            })}
        </div>
    </div>
);

const DefenderBuildings: React.FC<{ buildings: Building[] }> = ({ buildings }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3 className="text-xl font-bold text-center mb-3 text-gold">Defender's Village</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {buildings.map(b => (
          <div key={b.id || b.type} className="flex justify-between">
            <span>{BUILDING_DATA[b.type].name}</span>
            <span className="font-bold">Lvl {b.level}</span>
          </div>
        ))}
      </div>
    </div>
);

const ResourceBreakdown: React.FC<{ initial: BattleReport['defenderInitialResources'], loot: BattleReport['loot'] }> = ({ initial, loot }) => {
    const allResourceTypes = Object.keys(ICONS) as ResourceType[];
    const relevantResources = allResourceTypes.filter(r => (initial?.[r] || 0) > 0 || (loot?.[r] || 0) > 0);

    if (relevantResources.length === 0) {
      return <p className="text-center text-gray-400 mt-2">No resources were available.</p>;
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-400 border-b border-gray-600 pb-1">
            <span className="text-left">Resource</span>
            <span className="text-center">Available</span>
            <span className="text-center">Looted</span>
            <span className="text-center">Remaining</span>
        </div>
        {relevantResources.map(resource => {
            const Icon = ICONS[resource];
            const initialAmount = Math.floor(initial[resource]);
            const lootedAmount = Math.floor(loot[resource]);
            const remainingAmount = initialAmount - lootedAmount;
            return (
                <div key={resource} className="grid grid-cols-4 gap-2 items-center">
                    <div className="flex items-center"><Icon /><span className="ml-2">{resource}</span></div>
                    <span className="text-center">{initialAmount}</span>
                    <span className="text-center text-green-400">{lootedAmount > 0 ? `+${lootedAmount}`: '0'}</span>
                    <span className="text-center">{remainingAmount < 0 ? 0 : remainingAmount}</span>
                </div>
            )
        })}
      </div>
    );
};


const BattleReportView: React.FC<BattleReportViewProps> = ({ report, onBack }) => {
  const luckPercent = (report.attackerLuck * 100).toFixed(2);
  const luckColor = report.attackerLuck >= 0 ? 'text-green-400' : 'text-red-400';
  const luckSign = report.attackerLuck >= 0 ? '+' : '';

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
            <button 
              onClick={onBack} 
              className="text-gray-300 hover:text-white text-sm font-bold flex items-center"
              aria-label="Back to reports list"
            >
                <span className="text-xl">&larr;</span> Back
            </button>
            <h2 className={`text-2xl font-bold ${report.victory ? 'text-green-400' : 'text-red-400'}`}>
                {report.victory ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <div className="w-16"></div> {/* Spacer */}
        </div>
        <p className="text-center text-gray-400 text-sm">Attack on Village at ({report.defenderCoords.x}, {report.defenderCoords.y})</p>
        <div className="text-center text-gray-400 mb-4 text-sm flex justify-center items-center gap-x-6 gap-y-1 flex-wrap">
            <span>
                Attacker Luck: <span className={`font-bold ${luckColor}`}>{luckSign}{luckPercent}%</span>
            </span>
            <span>
                Defender Wall Level: <span className="font-bold text-gray-200">{report.defenderWallLevel}</span>
            </span>
        </div>
      
        <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex flex-col md:flex-row gap-4">
                <TroopBreakdown title="Attacker" initial={report.attackerTroops} losses={report.attackerLosses} />
                <TroopBreakdown title="Defender" initial={report.defenderTroops} losses={report.defenderLosses} />
            </div>
            
            {report.defenderBuildings && (
              <div className="mt-6">
                <DefenderBuildings buildings={report.defenderBuildings} />
              </div>
            )}

            <div className="mt-6 bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-center mb-3 text-gold">Resources</h3>
                <ResourceBreakdown initial={report.defenderInitialResources} loot={report.loot} />
            </div>
        </div>
    </div>
  );
};

export default BattleReportView;