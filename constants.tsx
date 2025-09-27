import React from 'react';
import { BuildingType, TroopType, ResourceType, BuildingData, TroopData } from './types';

export const WoodIcon = () => <span title="Wood" className="text-wood inline-block">🪵</span>;
export const FoodIcon = () => <span title="Food" className="text-food inline-block">🌾</span>;
export const GoldIcon = () => <span title="Gold" className="text-gold inline-block">💰</span>;
export const ClayIcon = () => <span title="Clay" className="text-orange-500 inline-block">🧱</span>;
export const IronIcon = () => <span title="Iron" className="text-gray-400 inline-block">🔩</span>;


export const ICONS: Record<ResourceType, React.FC> = {
  [ResourceType.Wood]: WoodIcon,
  [ResourceType.Food]: FoodIcon,
  [ResourceType.Gold]: GoldIcon,
  [ResourceType.Clay]: ClayIcon,
  [ResourceType.Iron]: IronIcon,
};

export const BUILDING_DATA: Record<BuildingType, BuildingData> = {
  [BuildingType.TownHall]: {
    name: "Town Hall",
    description: "The heart of your village. Upgrading increases Gold generation.",
    cost: [
        [], // Level 1 is free
        [{ resource: ResourceType.Wood, amount: 200 }, { resource: ResourceType.Food, amount: 200 }],
        [{ resource: ResourceType.Wood, amount: 400 }, { resource: ResourceType.Food, amount: 400 }, { resource: ResourceType.Clay, amount: 100}],
    ],
    buildTime: [0, 120, 240],
    production: { resource: ResourceType.Gold, amount: [1, 2, 3] },
  },
  [BuildingType.LumberMill]: {
    name: "Lumber Mill",
    description: "Generates Wood.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 25 }],
        [{ resource: ResourceType.Wood, amount: 100 }],
        [{ resource: ResourceType.Wood, amount: 200 }, { resource: ResourceType.Food, amount: 50 }],
    ],
    buildTime: [15, 30, 60],
    production: { resource: ResourceType.Wood, amount: [2, 4, 6] },
  },
  [BuildingType.Farm]: {
    name: "Farm",
    description: "Generates Food and increases your village's population capacity.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 20 }],
        [{ resource: ResourceType.Wood, amount: 60 }, { resource: ResourceType.Food, amount: 40 }],
        [{ resource: ResourceType.Wood, amount: 120 }, { resource: ResourceType.Food, amount: 80 }],
    ],
    buildTime: [20, 40, 80],
    production: { resource: ResourceType.Food, amount: [3, 5, 8] },
    population: [10, 20, 35],
  },
  [BuildingType.GoldMine]: {
    name: "Gold Mine",
    description: "Generates Gold.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 50 }],
        [{ resource: ResourceType.Wood, amount: 200 }, { resource: ResourceType.Food, amount: 100 }],
        [{ resource: ResourceType.Wood, amount: 400 }, { resource: ResourceType.Food, amount: 200 }, {resource: ResourceType.Clay, amount: 50}],
    ],
    buildTime: [45, 90, 180],
    production: { resource: ResourceType.Gold, amount: [2, 3, 5] },
  },
  [BuildingType.ClayPit]: {
    name: "Clay Pit",
    description: "Mines Clay from the earth.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 40 }],
        [{ resource: ResourceType.Wood, amount: 160 }, { resource: ResourceType.Food, amount: 80 }],
        [{ resource: ResourceType.Wood, amount: 320 }, { resource: ResourceType.Food, amount: 160 }],
    ],
    buildTime: [30, 60, 120],
    production: { resource: ResourceType.Clay, amount: [2, 4, 7] },
  },
  [BuildingType.IronMine]: {
    name: "Iron Mine",
    description: "Extracts valuable Iron ore.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 60 }],
        [{ resource: ResourceType.Wood, amount: 240 }, { resource: ResourceType.Clay, amount: 200 }],
        [{ resource: ResourceType.Wood, amount: 480 }, { resource: ResourceType.Clay, amount: 400 }],
    ],
    buildTime: [60, 120, 240],
    production: { resource: ResourceType.Iron, amount: [1, 2, 4] },
  },
  [BuildingType.Barracks]: {
    name: "Barracks",
    description: "Allows you to train troops. Upgrading increases training speed.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 75 }],
        [{ resource: ResourceType.Wood, amount: 300 }, { resource: ResourceType.Gold, amount: 100 }, { resource: ResourceType.Iron, amount: 50 }],
    ],
    buildTime: [60, 120],
    trainTimeReduction: [0.1, 0.2], // 10% faster at level 1, 20% at level 2
  },
  [BuildingType.Warehouse]: {
    name: "Warehouse",
    description: "Increases the storage capacity for all your resources.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 40 }],
        [{ resource: ResourceType.Wood, amount: 250 }, { resource: ResourceType.Clay, amount: 100 }],
        [{ resource: ResourceType.Wood, amount: 500 }, { resource: ResourceType.Clay, amount: 250 }, { resource: ResourceType.Iron, amount: 100 }],
    ],
    buildTime: [30, 90, 180],
    storage: [1000, 2500, 5000],
  },
  [BuildingType.Wall]: {
    name: "Wall",
    description: "Provides a defensive bonus to your village during attacks.",
    cost: [
        [{ resource: ResourceType.Gold, amount: 100 }],
        [{ resource: ResourceType.Wood, amount: 400 }, { resource: ResourceType.Clay, amount: 300 }, { resource: ResourceType.Iron, amount: 50 }],
        [{ resource: ResourceType.Wood, amount: 800 }, { resource: ResourceType.Clay, amount: 600 }, { resource: ResourceType.Iron, amount: 150 }],
    ],
    buildTime: [180, 360, 720],
    defenseBonus: [100, 250, 500],
  }
};

export const TROOP_DATA: Record<TroopType, TroopData> = {
  [TroopType.Villager]: {
    name: "Villager",
    description: "A basic worker. Not for combat. Speeds up construction.",
    cost: [{ resource: ResourceType.Food, amount: 50 }],
    trainTime: 10,
    requiredBuilding: BuildingType.TownHall,
    attack: 1,
    defense: 1,
    carry: 20,
    speed: 15, // seconds per grid unit
  },
  [TroopType.Swordsman]: {
    name: "Swordsman",
    description: "A basic melee unit. Strong and sturdy.",
    cost: [{ resource: ResourceType.Food, amount: 50 }, { resource: ResourceType.Gold, amount: 20 }, { resource: ResourceType.Iron, amount: 10 }],
    trainTime: 30,
    requiredBuilding: BuildingType.Barracks,
    attack: 10,
    defense: 10,
    carry: 15,
    speed: 10, // seconds per grid unit
  },
  [TroopType.Archer]: {
    name: "Archer",
    description: "A ranged unit, good for defense and attacking from a distance.",
    cost: [{ resource: ResourceType.Wood, amount: 30 }, { resource: ResourceType.Food, amount: 40 }, { resource: ResourceType.Gold, amount: 30 }],
    trainTime: 45,
    requiredBuilding: BuildingType.Barracks,
    attack: 12,
    defense: 8,
    carry: 10,
    speed: 8, // seconds per grid unit
  },
};

export const TICK_INTERVAL = 1000; // ms
export const MAX_BUILD_SLOTS = 5;
export const VILLAGER_BUILD_BONUS = 0.05; // 5% faster build time per villager
export const BASE_STORAGE_CAPACITY = 500;
export const MAP_SIZE = { x: 20, y: 20 };
export const BARBARIAN_VILLAGE_COUNT = 15;
export const BARBARIAN_VILLAGE_MAX_TROOPS = 10;
export const COMBAT_LUCK_FACTOR = 0.25; // +/- 25% luck