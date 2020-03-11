import { ZSGlobal } from '.';
import { RCStorage } from '../utils/rcStorage';
import { StateEventBus } from '../utils/stateEventBus';
import { EnchantmentEntry, EntityEntry, FluidEntry, ModEntry } from './rcFile';
import { defaultSettings } from './setting';

export const zGlobal: ZSGlobal = {
  // global state bus
  bus: new StateEventBus(),

  // whether it's a project
  isProject: true,

  // root folder of a project
  baseFolder: '',

  // global setting(default)
  setting: defaultSettings,
  documentSettings: new Map(),

  // .zsrc file
  rcFile: {
    mcVersion: '',
    forgeVersion: '',
    probeVersion: '',
    config: {
      mods: true,
      items: true,
      enchantments: true,
      entities: true,
      fluids: true,
      oredictionary: true,
    },

    mods: [],
    items: [],
    enchantments: [],
    entities: [],
    fluids: [],
    oredictionary: [],

    zentype: [],
    zenpackage: {},
    globals: {},
  },

  mods: new Map<string, ModEntry>(),
  items: new RCStorage('item', 3),
  enchantments: new Map<string, EnchantmentEntry[]>(),
  entities: new Map<string, EntityEntry[]>(),
  fluids: new Map<string, FluidEntry>(),
  packages: {},

  // zs file
  zsFiles: new Map(),
};
