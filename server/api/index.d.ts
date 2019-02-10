import {
  ItemEntry,
  EntityEntry,
  EnchantmentEntry,
  FluidEntry,
  ModEntry,
  ZSRCFile,
} from './rcFile';
import { PriorityTreeItem } from '../../api/requests/PriorityTreeRequest';
import { ZenParsedFile } from './zenParsedFile';

/**
 * Settings
 */
export interface ZenScriptSettings {
  maxNumberOfProblems: number;
  maxHistoryEntries: number;

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

  // .zsrc File
  rcFile: ZSRCFile;
  mods: Map<string, ModEntry>;
  items: Map<string, ItemEntry[]>;
  enchantments: Map<string, EnchantmentEntry[]>;
  entities: Map<string, EntityEntry[]>;
  fluids: Map<string, FluidEntry>;

  // zs file
  zsFiles: Map<string, ZenParsedFile>;
}
