import {
  ItemEntry,
  EntityEntry,
  EnchantmentEntry,
  FluidEntry,
  ModEntry,
  ZSRCFile,
} from './rcFile';

/**
 * Settings
 */
export interface ZenScriptSettings {
  maxNumberOfProblems: number;
  maxHistoryEntries: number;
}

/**
 * Global
 */
export interface IDMap {
  items: Map<number, ItemEntry>;
  entities: Map<number, EntityEntry>;
}

export interface ZSGlobal {
  isProject: boolean;
  baseFolder: string;
  setting: ZenScriptSettings;

  // .zsrc File
  rcFile: ZSRCFile;
  mods: Map<string, ModEntry>;
  items: Map<string, ItemEntry[]>;
  enchantments: Map<string, EnchantmentEntry[]>;
  entities: Map<string, EntityEntry[]>;
  fluids: Map<string, FluidEntry[]>;

  idMaps: IDMap;
}
