import { RCStorage } from '../utils/rcStorage';
import {
  EnchantmentEntry,
  EntityEntry,
  FluidEntry,
  ModEntry,
  ZSRCFile,
} from './rcFile';
import { ZenParsedFile } from './zenParsedFile';

/**
 * Settings
 */
export interface ZenScriptSettings {
  maxNumberOfProblems: number;
  maxHistoryEntries: number;

  supportMinecraftFolderMode: boolean;
  showIsProjectWarn: boolean;
  autoshowLTCompletion: boolean;
  modIdItemCompletion: boolean;
}

/**
 * Global
 */
export interface ZSGlobal {
  isProject: boolean;
  baseFolder: string;
  setting: ZenScriptSettings;
  documentSettings: Map<string, Thenable<ZenScriptSettings>>;

  // .zsrc File
  rcFile: ZSRCFile;
  mods: Map<string, ModEntry>;
  items: RCStorage;
  enchantments: Map<string, EnchantmentEntry[]>;
  entities: Map<string, EntityEntry[]>;
  fluids: Map<string, FluidEntry>;

  // zs file
  zsFiles: Map<string, ZenParsedFile>;
}
