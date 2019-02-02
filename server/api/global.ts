import { defaultSettings } from './setting';
import { ZSGlobal } from '.';
import {
  ModEntry,
  ItemEntry,
  EnchantmentEntry,
  EntityEntry,
  FluidEntry,
} from './rcFile';
import { PriorityTreeItem } from '../../out/api/requests/PriorityTreeRequest';

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
  },

  mods: new Map<string, ModEntry>(),
  items: new Map<string, ItemEntry[]>(),
  enchantments: new Map<string, EnchantmentEntry[]>(),
  entities: new Map<string, EntityEntry[]>(),
  fluids: new Map<string, FluidEntry[]>(),

  idMaps: {
    items: new Map<number, ItemEntry>(),
    entities: new Map<number, EntityEntry>(),
  },

  // zs file
  zsFiles: new Map(),
};
