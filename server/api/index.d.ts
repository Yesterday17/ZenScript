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

export interface Directory {
  [key: string]: string | Directory;
}

export interface ZenFunction {
  params: string[];
  return: string;
}

export interface Directory {
  [key: string]: string | Directory;
}

export interface ZenFunction {
  params: string[];
  return: string;
}
