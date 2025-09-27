export enum ResourceType {
  Wood = 'Wood',
  Food = 'Food',
  Gold = 'Gold',
  Clay = 'Clay',
  Iron = 'Iron',
}

export enum BuildingType {
  TownHall = 'TownHall',
  Farm = 'Farm',
  LumberMill = 'LumberMill',
  Barracks = 'Barracks',
  GoldMine = 'GoldMine',
  ClayPit = 'ClayPit',
  IronMine = 'IronMine',
  Warehouse = 'Warehouse',
  Wall = 'Wall',
}

export enum TroopType {
  Villager = 'Villager',
  Swordsman = 'Swordsman',
  Archer = 'Archer',
}

export interface Cost {
  resource: ResourceType;
  amount: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
}

export interface QueuedItem {
  id:string;
  type: BuildingType | TroopType;
  startTime: number;
  finishTime: number;
  targetLevel?: number; // Added for building upgrades
}

export type Resources = Record<ResourceType, number>;
export type Troops = Record<TroopType, number>;

export interface Coordinates {
  x: number;
  y: number;
}

export interface BarbarianVillage {
  id: string;
  coordinates: Coordinates;
  resources: Resources;
  troops: Troops;
  lastUpdated: number;
  points: number;
  buildings: Building[];
}

export enum MarchStatus {
  Marching,
  Returning,
}

export interface March {
  id: string;
  origin: Coordinates;
  target: Coordinates;
  targetId: string;
  troops: Troops;
  status: MarchStatus;
  startTime: number;
  arrivalTime: number;
  returnTime: number;
  loot: Resources;
}

export interface BuildingData {
  name: string;
  description: string;
  cost: Cost[][]; // Cost per level
  buildTime: number[]; // Build time per level
  production?: {
    resource: ResourceType;
    amount: number[]; // Production per level
  };
  population?: number[]; // Population capacity per level
  storage?: number[]; // Storage capacity per level
  defenseBonus?: number[]; // Defense bonus per level
  trainTimeReduction?: number[]; // Percentage reduction in troop train time
};

export interface TroopData {
  name: string;
  description: string;
  cost: Cost[];
  trainTime: number; // in seconds
  requiredBuilding: BuildingType;
  attack: number;
  defense: number;
  carry: number; // resource carrying capacity
  speed: number; // seconds per grid unit
};

export interface BattleReport {
  id: string;
  timestamp: number;
  attackerCoords: Coordinates;
  defenderCoords: Coordinates;
  attackerTroops: Troops;
  defenderTroops: Troops;
  attackerLosses: Troops;
  defenderLosses: Troops;
  loot: Resources;
  victory: boolean; // From the attacker's perspective
  isRead: boolean;
  attackerLuck: number; // e.g., 0.15 for +15%
  defenderWallLevel: number;
  defenderBuildings: Building[];
  defenderInitialResources: Resources;
}