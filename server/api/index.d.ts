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
  maxHistoryEntries: number;

  showIsProjectWarn: boolean;

  // Whether to show modid autocompletion with bracketHandlers.
  modIdItemCompletion: boolean;
}

export interface Directory {
  [key: string]: string | Directory;
}

export interface ZenFunction {
  params: string[];
  return: string;
}
