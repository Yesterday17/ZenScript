import {
  ItemEntry,
  ModEntry,
  ZSRCFile,
  EntityEntry,
  EnchantmentEntry,
  FluidEntry
} from './rcFile';
import { ZenScriptSettings } from './setting';

export const zGlobal = {
  // 是否为 Project
  isProject: true as boolean,

  // root folder of a project
  baseFolder: '' as string,

  // global setting
  setting: {} as ZenScriptSettings,

  // .zsrc file
  rcFile: {
    mcVersion: '',
    forgeVersion: '',

    mods: [] as ModEntry[],
    items: [] as ItemEntry[],
    enchantments: [] as EnchantmentEntry[],
    entities: [] as EntityEntry[],
    fluids: [] as FluidEntry[]
  } as ZSRCFile,

  mods: new Map<string, ModEntry>(),
  items: new Map<string, ItemEntry[]>(),
  enchantments: new Map<string, EnchantmentEntry[]>(),
  entities: new Map<string, EntityEntry[]>(),
  fluids: new Map<string, FluidEntry[]>(),

  idMaps: {
    items: new Map<number, ItemEntry>(),
    entities: new Map<number, EntityEntry>()
  }
};
