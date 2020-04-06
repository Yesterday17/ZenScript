import { ZSGlobal } from '.';
import { RCStorage } from '../utils/rcStorage';
import { StateEventBus } from '../utils/stateEventBus';
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
  rcFile: undefined,

  // directory
  directory: {},

  mods: new Map(),
  items: new RCStorage('item', 3),
  enchantments: new Map(),
  entities: new Map(),
  fluids: new Map(),
  packages: {},
  global: new Map(),
  globalFunction: new Map(),

  // zs file
  zsFiles: new Map(),
};
