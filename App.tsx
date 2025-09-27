import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResourceType, BuildingType, TroopType, Resources, Building, Troops, QueuedItem, Cost,
  Coordinates, BarbarianVillage, March, MarchStatus, BattleReport
} from './types';
import { 
  BUILDING_DATA, TROOP_DATA, TICK_INTERVAL, MAX_BUILD_SLOTS, VILLAGER_BUILD_BONUS, 
  BASE_STORAGE_CAPACITY, MAP_SIZE, BARBARIAN_VILLAGE_COUNT, BARBARIAN_VILLAGE_MAX_TROOPS,
  COMBAT_LUCK_FACTOR
} from './constants';
import ResourceDisplay from './components/ResourceDisplay';
import ActionPanel from './components/ActionPanel';
import VillageDisplay from './components/VillageDisplay';
import ArmyDisplay from './components/ArmyDisplay';
import BuildingDetailModal from './components/BuildingDetailModal';
import MinimapIcon from './components/MinimapIcon';
import WorldMap from './components/WorldMap';
import InboxIcon from './components/InboxIcon';
import InboxModal from './components/InboxModal';
import TroopDetailModal from './components/TroopDetailModal';

const App: React.FC = () => {
  const [villageName, setVillageName] = useState('Gemini Village');
  const [resources, setResources] = useState<Resources>({
    [ResourceType.Wood]: 100,
    [ResourceType.Food]: 100,
    [ResourceType.Gold]: 50,
    [ResourceType.Clay]: 0,
    [ResourceType.Iron]: 0,
  });
  const [buildings, setBuildings] = useState<Building[]>([
    { id: 'initial_th', type: BuildingType.TownHall, level: 1 }
  ]);
  const [troops, setTroops] = useState<Troops>({
      [TroopType.Villager]: 5,
      [TroopType.Swordsman]: 0,
      [TroopType.Archer]: 0
  });
  const [buildQueue, setBuildQueue] = useState<QueuedItem[]>([]);
  const [trainQueue, setTrainQueue] = useState<QueuedItem[]>([]);
  const [gameLog, setGameLog] = useState<string[]>(["Your village has been founded!"]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [populationCap, setPopulationCap] = useState(0);
  const [resourceCaps, setResourceCaps] = useState<Resources>({
    [ResourceType.Wood]: BASE_STORAGE_CAPACITY,
    [ResourceType.Food]: BASE_STORAGE_CAPACITY,
    [ResourceType.Gold]: BASE_STORAGE_CAPACITY,
    [ResourceType.Clay]: BASE_STORAGE_CAPACITY,
    [ResourceType.Iron]: BASE_STORAGE_CAPACITY,
  });
  
  // World & Combat State
  const [showMap, setShowMap] = useState(false);
  const [playerCoordinates] = useState<Coordinates>({ x: Math.floor(MAP_SIZE.x / 2), y: Math.floor(MAP_SIZE.y / 2) });
  const [barbarianVillages, setBarbarianVillages] = useState<BarbarianVillage[]>([]);
  const [marches, setMarches] = useState<March[]>([]);
  const [reports, setReports] = useState<BattleReport[]>([]);
  
  // UI State
  const [showInbox, setShowInbox] = useState(false);
  const [selectedTroop, setSelectedTroop] = useState<TroopType | null>(null);

  const unreadReportCount = reports.filter(r => !r.isRead).length;

  const homeTroops = Object.values(troops).reduce((sum, count) => sum + count, 0);
  const troopsInMarches = marches.reduce((marchTotal, march) => {
    return marchTotal + Object.values(march.troops).reduce((troopSum, count) => troopSum + count, 0);
  }, 0);
  const totalPopulation = homeTroops + troopsInMarches;
  
  const calculateVillagePoints = useCallback((villageBuildings: Building[]): number => {
    return villageBuildings.reduce((totalPoints, building) => {
      // Sum of levels formula: (n * (n+1)) / 2 gives points that scale quadratically with level
      const levelPoints = (building.level * (building.level + 1) / 2) * 5; // Multiplier to make points feel more substantial
      return totalPoints + Math.floor(levelPoints);
    }, 0);
  }, []);

  // Initial setup for Barbarian Villages
  useEffect(() => {
    const existingCoords = new Set([`${playerCoordinates.x},${playerCoordinates.y}`]);
    const barbarians: BarbarianVillage[] = [];
    for (let i = 0; i < BARBARIAN_VILLAGE_COUNT; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * MAP_SIZE.x);
        y = Math.floor(Math.random() * MAP_SIZE.y);
      } while (existingCoords.has(`${x},${y}`));
      
      existingCoords.add(`${x},${y}`);

      const barbBuildings: Building[] = [
        { id: `barb_${i}_th`, type: BuildingType.TownHall, level: Math.floor(Math.random() * 2) + 1 }, // Lvl 1-2
      ];
      if (Math.random() > 0.3) barbBuildings.push({ id: `barb_${i}_lm`, type: BuildingType.LumberMill, level: Math.floor(Math.random() * 5) + 1 });
      if (Math.random() > 0.3) barbBuildings.push({ id: `barb_${i}_fa`, type: BuildingType.Farm, level: Math.floor(Math.random() * 5) + 1 });
      if (Math.random() > 0.5) barbBuildings.push({ id: `barb_${i}_cp`, type: BuildingType.ClayPit, level: Math.floor(Math.random() * 3) + 1 });
      if (Math.random() > 0.7) barbBuildings.push({ id: `barb_${i}_im`, type: BuildingType.IronMine, level: Math.floor(Math.random() * 2) + 1 });
      if (Math.random() > 0.2) barbBuildings.push({ id: `barb_${i}_wh`, type: BuildingType.Warehouse, level: Math.floor(Math.random() * 3) + 1 });

      const points = calculateVillagePoints(barbBuildings);

      barbarians.push({
        id: `barb_${i}_${Date.now()}`,
        coordinates: { x, y },
        resources: { Wood: 100, Food: 100, Gold: 20, Clay: 50, Iron: 20 },
        troops: { Swordsman: Math.floor(Math.random() * 5) + 1, Archer: 0, Villager: 0 },
        lastUpdated: Date.now(),
        buildings: barbBuildings,
        points,
      });
    }
    setBarbarianVillages(barbarians);
  }, [playerCoordinates, calculateVillagePoints]);

  useEffect(() => {
    const cap = buildings.reduce((total, building) => {
      const data = BUILDING_DATA[building.type];
      if (data.population) {
        const levelIndex = building.level - 1;
        if (levelIndex >= 0 && levelIndex < data.population.length) {
          return total + data.population[levelIndex];
        }
      }
      return total;
    }, 5); // Base population
    setPopulationCap(cap);
  }, [buildings]);

  useEffect(() => {
    const warehouse = buildings.find(b => b.type === BuildingType.Warehouse);
    const warehouseLevel = warehouse?.level || 0;
    const data = BUILDING_DATA[BuildingType.Warehouse];
    const capacity = warehouseLevel > 0 && data.storage ? data.storage[warehouseLevel - 1] : BASE_STORAGE_CAPACITY;

    setResourceCaps({
        [ResourceType.Wood]: capacity,
        [ResourceType.Food]: capacity,
        [ResourceType.Gold]: capacity,
        [ResourceType.Clay]: capacity,
        [ResourceType.Iron]: capacity,
    });
  }, [buildings]);


  const addToLog = useCallback((message: string) => {
    setGameLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  const canAfford = useCallback((costs: Cost[]): boolean => {
    if (!costs) return false;
    return costs.every(cost => resources[cost.resource] >= cost.amount);
  }, [resources]);

  const spendResources = (costs: Cost[]) => {
    setResources(prev => {
      const newResources = { ...prev };
      costs.forEach(cost => {
        newResources[cost.resource] -= cost.amount;
      });
      return newResources;
    });
  };
  
  const handleBuildOrUpgrade = (buildingType: BuildingType) => {
    const buildingData = BUILDING_DATA[buildingType];
    const currentBuilding = buildings.find(b => b.type === buildingType);
    const currentLevel = currentBuilding?.level || 0;
    
    if (buildQueue.length >= MAX_BUILD_SLOTS) {
      addToLog(`Build queue is full (Max ${MAX_BUILD_SLOTS}).`);
      return;
    }

    if (buildQueue.some(item => item.type === buildingType)) {
      addToLog(`${buildingData.name} is already in the build queue.`);
      return;
    }
    
    const nextLevel = currentLevel + 1;
    const cost = buildingData.cost[currentLevel];
    if (!cost) {
      addToLog(`${buildingData.name} is at max level.`);
      return;
    }

    if (!canAfford(cost)) {
      addToLog(`Not enough resources to ${currentLevel > 0 ? 'upgrade' : 'build'} ${buildingData.name}.`);
      return;
    }

    spendResources(cost);
    const now = Date.now();
    const baseBuildTime = buildingData.buildTime[currentLevel];
    const buildTimeReduction = 1 + (troops[TroopType.Villager] * VILLAGER_BUILD_BONUS);
    const effectiveBuildTime = Math.round(baseBuildTime / buildTimeReduction);

    const newItem: QueuedItem = {
      id: `building_${now}_${buildingType}`,
      type: buildingType,
      startTime: now,
      finishTime: now + effectiveBuildTime * 1000,
      targetLevel: nextLevel,
    };
    setBuildQueue(prev => [...prev, newItem]);
    const action = currentLevel > 0 ? 'Upgrade' : 'Construction';
    addToLog(`${action} started: ${buildingData.name} to Lvl ${nextLevel}.`);
    setSelectedBuilding(null); // Close modal on action
  };


  const handleTrain = (troopType: TroopType, amount: number) => {
    if (amount <= 0) return;

    if (totalPopulation + amount > populationCap) {
        addToLog(`Not enough housing for ${amount} troops. Available space: ${populationCap - totalPopulation}.`);
        return;
    }

    const data = TROOP_DATA[troopType];
    if (!buildings.some(b => b.type === data.requiredBuilding)) {
      addToLog(`Requires a ${BUILDING_DATA[data.requiredBuilding].name} to train.`);
      return;
    }

    const totalCost: Cost[] = data.cost.map(c => ({ resource: c.resource, amount: c.amount * amount }));
    if (!canAfford(totalCost)) {
      addToLog(`Not enough resources for ${amount} ${data.name}(s).`);
      return;
    }

    // Calculate training time reduction from Barracks
    const barracks = buildings.find(b => b.type === BuildingType.Barracks);
    const barracksLevel = barracks?.level || 0;
    let trainingTimeReduction = 0;
    if (barracksLevel > 0) {
        const barracksData = BUILDING_DATA[BuildingType.Barracks];
        if (barracksData.trainTimeReduction) {
            trainingTimeReduction = barracksData.trainTimeReduction[barracksLevel - 1] || 0;
        }
    }
    const effectiveTrainTime = data.trainTime * (1 - trainingTimeReduction);

    spendResources(totalCost);
    const now = Date.now();
    const lastItemInQueue = trainQueue.length > 0 ? trainQueue[trainQueue.length - 1] : null;
    let nextStartTime = lastItemInQueue ? lastItemInQueue.finishTime : now;

    const newItems: QueuedItem[] = [];
    for (let i = 0; i < amount; i++) {
      const startTime = nextStartTime;
      const finishTime = startTime + effectiveTrainTime * 1000;
      newItems.push({
        id: `troop_${troopType}_${startTime}_${i}`,
        type: troopType,
        startTime,
        finishTime,
      });
      nextStartTime = finishTime;
    }

    setTrainQueue(prev => [...prev, ...newItems]);
    addToLog(`Queued ${amount} ${data.name}(s) for training.`);
  };
  
  const handleLaunchAttack = (target: BarbarianVillage, attackingTroops: Troops) => {
    const now = Date.now();
    
    // Find slowest troop speed (highest seconds/unit value)
    let slowestSpeed = 0;
    (Object.keys(attackingTroops) as TroopType[]).forEach(type => {
        if (attackingTroops[type] > 0) {
            const troopSpeed = TROOP_DATA[type].speed;
            if (troopSpeed > slowestSpeed) {
                slowestSpeed = troopSpeed;
            }
        }
    });

    if (slowestSpeed === 0) {
        addToLog("Cannot launch attack with no troops.");
        return;
    }

    const distance = Math.sqrt(
        Math.pow(playerCoordinates.x - target.coordinates.x, 2) +
        Math.pow(playerCoordinates.y - target.coordinates.y, 2)
    );
    const travelTime = Math.round(distance * slowestSpeed) * 1000;
    
    const newMarch: March = {
      id: `march_${now}`,
      origin: playerCoordinates,
      target: target.coordinates,
      targetId: target.id,
      troops: attackingTroops,
      status: MarchStatus.Marching,
      startTime: now,
      arrivalTime: now + travelTime,
      returnTime: now + travelTime * 2, // Placeholder, will be recalculated
      loot: { Wood: 0, Food: 0, Gold: 0, Clay: 0, Iron: 0 },
    };

    setMarches(prev => [...prev, newMarch]);
    setTroops(prev => {
      const newTroops = {...prev};
      (Object.keys(attackingTroops) as TroopType[]).forEach(type => {
        newTroops[type] -= attackingTroops[type];
      });
      return newTroops;
    });

    addToLog(`Launched attack on barbarian village at (${target.coordinates.x}, ${target.coordinates.y}).`);
    setShowMap(false);
  };

  const handleMarkReportAsRead = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? {...r, isRead: true} : r));
  }

  // Game Loop
  useEffect(() => {
    const gameTick = setInterval(() => {
      const now = Date.now();
      
      // Resource Generation
      setResources(prevResources => {
        let newResources = { ...prevResources };
        buildings.forEach(building => {
          const data = BUILDING_DATA[building.type];
          if (data.production && building.level > 0) {
            const productionAmount = data.production.amount[building.level - 1] || 0;
            const resource = data.production.resource;
            const cap = resourceCaps[resource];
            newResources[resource] = Math.min(newResources[resource] + productionAmount, cap);
          }
        });
        return newResources;
      });

      // Check Build Queue
      const finishedBuilds = buildQueue.filter(item => now >= item.finishTime);
      if (finishedBuilds.length > 0) {
        setBuildings(prevBuildings => {
            let newBuildings = [...prevBuildings];
            finishedBuilds.forEach(item => {
                const buildingType = item.type as BuildingType;
                const targetLevel = item.targetLevel!;
                const existingBuildingIndex = newBuildings.findIndex(b => b.type === buildingType);

                if (existingBuildingIndex > -1) {
                    newBuildings[existingBuildingIndex] = { ...newBuildings[existingBuildingIndex], level: targetLevel };
                } else {
                    newBuildings.push({ id: item.id, type: buildingType, level: targetLevel });
                }
                addToLog(`${BUILDING_DATA[buildingType].name} reached Lvl ${targetLevel}!`);
            });
            return newBuildings;
        });

        setBuildQueue(prevQueue => prevQueue.filter(item => now < item.finishTime));
      }
      
      // Check Train Queue
      const finishedTrainItems = trainQueue.filter(item => now >= item.finishTime);
      if (finishedTrainItems.length > 0) {
        const troopsToAdd: Partial<Record<TroopType, number>> = {};
        finishedTrainItems.forEach(item => {
          const troopType = item.type as TroopType;
          troopsToAdd[troopType] = (troopsToAdd[troopType] || 0) + 1;
        });

        setTroops(prev => {
          const newTroops = { ...prev };
          (Object.keys(troopsToAdd) as TroopType[]).forEach(type => {
            newTroops[type] = (newTroops[type] || 0) + troopsToAdd[type]!;
          });
          return newTroops;
        });

        setTrainQueue(prev => prev.filter(item => now < item.finishTime));

        (Object.keys(troopsToAdd) as TroopType[]).forEach(type => {
          if (troopsToAdd[type]! > 1) {
            addToLog(`${troopsToAdd[type]} ${TROOP_DATA[type].name}s have been trained!`);
          } else {
            addToLog(`${TROOP_DATA[type].name} has been trained!`);
          }
        });
      }

      // Barbarian Village Growth
      setBarbarianVillages(prev => prev.map(village => {
        const secondsPassed = (now - village.lastUpdated) / 1000;
        if (secondsPassed < 10) return village; // Update every 10s

        const newResources = {...village.resources};
        newResources.Wood += 1 * (secondsPassed / 10);
        newResources.Food += 1 * (secondsPassed / 10);
        
        let newTroops = {...village.troops};
        const totalBarbTroops = Object.values(newTroops).reduce((s, c) => s + c, 0);
        const cost = TROOP_DATA.Swordsman.cost;
        if (totalBarbTroops < BARBARIAN_VILLAGE_MAX_TROOPS && newResources.Food >= cost[0].amount) {
            newTroops.Swordsman += 1;
            newResources.Food -= cost[0].amount;
        }

        return {...village, resources: newResources, troops: newTroops, lastUpdated: now};
      }));

      // Check Marches
      const updatedMarches: March[] = [];
      const completedMarches: March[] = [];
      marches.forEach(march => {
        if (march.status === MarchStatus.Marching && now >= march.arrivalTime) {
          // Combat Resolution
          const targetVillage = barbarianVillages.find(v => v.id === march.targetId);
          if (targetVillage) {
            const defenderInitialResources = { ...targetVillage.resources };

            // Calculate base power
            const baseAttackerPower = (Object.keys(march.troops) as TroopType[]).reduce((sum, type) => sum + march.troops[type] * TROOP_DATA[type].attack, 0);
            const baseDefenderPower = (Object.keys(targetVillage.troops) as TroopType[]).reduce((sum, type) => sum + targetVillage.troops[type] * TROOP_DATA[type].defense, 0);
            
            // Apply luck
            const attackerLuck = (Math.random() - 0.5) * 2 * COMBAT_LUCK_FACTOR; // e.g., value between -0.25 and 0.25
            const defenderLuck = (Math.random() - 0.5) * 2 * COMBAT_LUCK_FACTOR;
            
            // Since barbarian villages don't have buildings, their wall level is 0.
            const defenderWallLevel = 0;
            const wallBonus = 0;

            const attackerPower = baseAttackerPower * (1 + attackerLuck);
            const defenderPower = (baseDefenderPower + wallBonus) * (1 + defenderLuck);

            const attackerWins = attackerPower > defenderPower;
            const survivingTroops = {...march.troops};
            const attackerLosses: Troops = { Villager: 0, Swordsman: 0, Archer: 0 };
            const defenderLosses: Troops = { Villager: 0, Swordsman: 0, Archer: 0 };
            let loot: Resources = { Wood: 0, Food: 0, Gold: 0, Clay: 0, Iron: 0 };
            
            if (attackerWins) {
                const lossRatio = defenderPower / attackerPower;
                (Object.keys(survivingTroops) as TroopType[]).forEach(type => {
                    const initialCount = march.troops[type];
                    const losses = Math.ceil(initialCount * lossRatio);
                    attackerLosses[type] = losses;
                    survivingTroops[type] = initialCount - losses;
                });
                defenderLosses.Swordsman = targetVillage.troops.Swordsman; // All defenders lost

                // Calculate loot based on carry capacity of SURVIVORS
                let totalCarry = (Object.keys(survivingTroops) as TroopType[]).reduce((sum, type) => sum + survivingTroops[type] * TROOP_DATA[type].carry, 0);
                const availableResources = {...targetVillage.resources};
                (Object.keys(availableResources) as ResourceType[]).forEach(res => {
                    const amountToLoot = Math.min(totalCarry, Math.floor(availableResources[res] * 0.5));
                    loot[res] += amountToLoot;
                    availableResources[res] -= amountToLoot;
                    totalCarry -= amountToLoot;
                });

                setBarbarianVillages(prev => prev.map(v => v.id === targetVillage.id ? {...v, troops: {Swordsman: 0, Archer: 0, Villager: 0}, resources: availableResources} : v));
            } else { // Defender wins
                const lossRatio = attackerPower / defenderPower;
                // Attackers lose all troops
                (Object.keys(survivingTroops) as TroopType[]).forEach(type => { 
                    attackerLosses[type] = march.troops[type];
                    survivingTroops[type] = 0; 
                });
                // Defenders lose some troops
                defenderLosses.Swordsman = Math.ceil(targetVillage.troops.Swordsman * lossRatio);
                const survivingDefenders = targetVillage.troops.Swordsman - defenderLosses.Swordsman;
                setBarbarianVillages(prev => prev.map(v => v.id === targetVillage.id ? {...v, troops: {Swordsman: survivingDefenders, Archer: 0, Villager: 0}} : v));
            }

            const newReport: BattleReport = {
                id: `report_${now}`,
                timestamp: now,
                attackerCoords: march.origin,
                defenderCoords: march.target,
                attackerTroops: march.troops,
                defenderTroops: targetVillage.troops,
                attackerLosses,
                defenderLosses,
                loot,
                victory: attackerWins,
                isRead: false,
                attackerLuck,
                defenderWallLevel,
                defenderBuildings: targetVillage.buildings,
                defenderInitialResources,
            };
            setReports(prev => [newReport, ...prev]);
            addToLog(`Battle report received from (${march.target.x}, ${march.target.y}).`);

            const returnTime = now + (march.arrivalTime - march.startTime);
            updatedMarches.push({ ...march, status: MarchStatus.Returning, returnTime, troops: survivingTroops, loot });

          } else { // Village not found, just return
            updatedMarches.push({ ...march, status: MarchStatus.Returning });
          }

        } else if (march.status === MarchStatus.Returning && now >= march.returnTime) {
          completedMarches.push(march);
        } else {
          updatedMarches.push(march);
        }
      });
      
      if (completedMarches.length > 0) {
        setTroops(prev => {
          const newTroops = {...prev};
          completedMarches.forEach(march => {
            (Object.keys(march.troops) as TroopType[]).forEach(type => {
              newTroops[type] += march.troops[type];
            });
          });
          return newTroops;
        });
        setResources(prev => {
          const newResources = {...prev};
          completedMarches.forEach(march => {
            (Object.keys(march.loot) as ResourceType[]).forEach(type => {
              const cap = resourceCaps[type];
              newResources[type] = Math.min(newResources[type] + march.loot[type], cap);
            });
            addToLog(`Your army has returned from (${march.target.x}, ${march.target.y}).`);
          });
          return newResources;
        });
      }

      setMarches(updatedMarches.filter(m => !completedMarches.some(c => c.id === m.id)));

    }, TICK_INTERVAL);

    return () => clearInterval(gameTick);
  }, [buildQueue, trainQueue, buildings, resourceCaps, barbarianVillages, marches, addToLog]);

  const handleNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    setVillageName(e.currentTarget.value);
  }

  const playerPoints = calculateVillagePoints(buildings);

  // --- DEBUG ---
  const handleDevFillResources = () => {
    setResources(resourceCaps);
    addToLog("DEV: Resources filled to capacity.");
  };

  const handleDevCompleteQueues = () => {
    if (buildQueue.length > 0) {
      setBuildings(prevBuildings => {
        let newBuildings = [...prevBuildings];
        buildQueue.forEach(item => {
          const buildingType = item.type as BuildingType;
          const targetLevel = item.targetLevel!;
          const existingBuildingIndex = newBuildings.findIndex(b => b.type === buildingType);
          if (existingBuildingIndex > -1) {
            newBuildings[existingBuildingIndex] = { ...newBuildings[existingBuildingIndex], level: targetLevel };
          } else {
            newBuildings.push({ id: item.id, type: buildingType, level: targetLevel });
          }
          addToLog(`DEV: Instantly completed ${BUILDING_DATA[buildingType].name} to Lvl ${targetLevel}!`);
        });
        return newBuildings;
      });
      setBuildQueue([]);
    }
  
    if (trainQueue.length > 0) {
      const troopsToAdd: Partial<Record<TroopType, number>> = {};
      trainQueue.forEach(item => {
        const troopType = item.type as TroopType;
        troopsToAdd[troopType] = (troopsToAdd[troopType] || 0) + 1;
      });
  
      setTroops(prev => {
        const newTroops = { ...prev };
        (Object.keys(troopsToAdd) as TroopType[]).forEach(type => {
          newTroops[type] = (newTroops[type] || 0) + troopsToAdd[type]!;
        });
        return newTroops;
      });
      setTrainQueue([]);
      
      (Object.keys(troopsToAdd) as TroopType[]).forEach(type => {
          addToLog(`DEV: Instantly trained ${troopsToAdd[type]} ${TROOP_DATA[type].name}(s)!`);
      });
    }
  
    if (buildQueue.length === 0 && trainQueue.length === 0) {
        addToLog("DEV: No active queues to complete.");
    }
  };
  // --- END DEBUG ---

  return (
    <div className="min-h-screen bg-gray-900 bg-cover bg-center p-4 md:p-8" style={{backgroundImage: "url('https://picsum.photos/seed/village/1920/1080')"}}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative container mx-auto">
        <header className="text-center mb-4">
            <input 
              type="text"
              value={villageName}
              onChange={handleNameChange}
              className="bg-transparent text-4xl md:text-6xl font-bold text-gold tracking-wider text-center w-full outline-none focus:ring-2 focus:ring-gold rounded-md p-2"
              style={{textShadow: '2px 2px 4px #000'}}
              aria-label="Village Name"
            />
            <p className="text-lg text-gray-300 font-semibold">Points: {playerPoints}</p>
        </header>
        
        <ResourceDisplay resources={resources} population={totalPopulation} populationCap={populationCap} resourceCaps={resourceCaps} />

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1 bg-black/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <ActionPanel 
              onTrain={handleTrain} 
              canAfford={canAfford} 
              buildings={buildings}
              resources={resources}
              troops={troops} 
              population={totalPopulation}
              populationCap={populationCap} 
              onSelectTroopInfo={setSelectedTroop}
            />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/50 p-6 rounded-lg border border-gray-700 shadow-lg">
              <VillageDisplay buildings={buildings} buildQueue={buildQueue} onSelectBuilding={setSelectedBuilding} />
            </div>
            <div className="bg-black/50 p-6 rounded-lg border border-gray-700 shadow-lg">
              <ArmyDisplay troops={troops} trainQueue={trainQueue} marches={marches} />
            </div>
          </div>
        </main>

        <footer className="mt-8 bg-black/50 p-4 rounded-lg border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-300 mb-2">Game Log</h3>
          <div className="space-y-1 text-sm text-gray-400 h-24 overflow-y-auto">
            {gameLog.map((msg, i) => <p key={i} className="animate-[fadeIn_0.5s_ease_in_out]">{msg}</p>)}
          </div>
        </footer>

        {selectedBuilding && (
            <BuildingDetailModal 
                buildingType={selectedBuilding}
                buildings={buildings}
                onClose={() => setSelectedBuilding(null)}
                onBuildOrUpgrade={handleBuildOrUpgrade}
                canAfford={canAfford}
                troops={troops}
            />
        )}
        
        {selectedTroop && (
            <TroopDetailModal
                troopType={selectedTroop}
                onClose={() => setSelectedTroop(null)}
            />
        )}

        <MinimapIcon onClick={() => setShowMap(true)} />
        <InboxIcon onClick={() => setShowInbox(true)} unreadCount={unreadReportCount} />

        {showMap && (
          <WorldMap 
            playerCoordinates={playerCoordinates}
            barbarianVillages={barbarianVillages}
            marches={marches}
            availableTroops={troops}
            onLaunchAttack={handleLaunchAttack}
            onClose={() => setShowMap(false)}
          />
        )}

        {showInbox && (
            <InboxModal
                reports={reports}
                onClose={() => setShowInbox(false)}
                onMarkAsRead={handleMarkReportAsRead}
            />
        )}

        {/* --- DEBUG PANEL --- */}
        <div className="fixed bottom-4 left-4 z-[100] bg-gray-800/80 p-3 rounded-lg border border-yellow-500 shadow-lg text-white space-y-2">
            <h4 className="text-sm font-bold text-center text-yellow-400">Debug Tools</h4>
            <button onClick={handleDevFillResources} className="w-full bg-blue-600 hover:bg-blue-500 text-xs font-bold py-1 px-2 rounded transition-colors">Fill Resources</button>
            <button onClick={handleDevCompleteQueues} className="w-full bg-green-700 hover:bg-green-600 text-xs font-bold py-1 px-2 rounded transition-colors">Complete Queues</button>
        </div>
      </div>
    </div>
  );
};

export default App;