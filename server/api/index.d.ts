import { RCStorage } from '../utils/rcStorage';
import { StateEventBus } from '../utils/stateEventBus';
import {
  EnchantmentEntry,
  EntityEntry,
  FluidEntry,
  ModEntry,
  ZSRCFile,
} from './rcFile';
import { ZenParsedFile } from './zenParsedFile';
import { CompletionItem } from 'vscode';

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
  bus: StateEventBus;

  isProject: boolean;
  baseFolder: string;
  setting: ZenScriptSettings;
  documentSettings: Map<string, Thenable<ZenScriptSettings>>;

  // .zsrc File
  rcFile: ZSRCFile;
  directory: Directory;

  mods: Map<string, ModEntry>;
  items: RCStorage;
  enchantments: Map<string, EnchantmentEntry[]>;
  entities: Map<string, EntityEntry[]>;
  fluids: Map<string, FluidEntry>;
  packages: Object;

  global: Map<String, Object>;
  globalFunction: Map<String, ZenFunction[]>;

  // zs file
  zsFiles: Map<string, ZenParsedFile>;
}

export interface Directory {
  [key: string]: string | Directory;
}

export interface ZenFunction {
  params: string[];
  return: string;
}
