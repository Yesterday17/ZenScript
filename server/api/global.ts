import { ZSGlobal } from '.';
import { RCStorage } from '../utils/rcStorage';
import { EnchantmentEntry, EntityEntry, FluidEntry, ModEntry } from './rcFile';
import { defaultSettings } from './setting';

export const zGlobal: ZSGlobal = {
  // whether it's a project
  isProject: true,

  // root folder of a project
  baseFolder: '',

  // global setting(default)
  setting: defaultSettings,

  // .zsrc file
  rcFile: {
    mcVersion: '',
    forgeVersion: '',

    mods: [],
    items: [],
    enchantments: [],
    entities: [],
    fluids: [],
    oredictionary: [],
  },

  mods: new Map<string, ModEntry>(),
  items: new RCStorage('item', 3),
  enchantments: new Map<string, EnchantmentEntry[]>(),
  entities: new Map<string, EntityEntry[]>(),
  fluids: new Map<string, FluidEntry>(),

  // zs file
  zsFiles: new Map(),
};
