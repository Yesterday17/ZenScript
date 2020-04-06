import { Directory, ZenFunction, ZenScriptSettings } from '.';
import { RCStorage } from '../utils/rcStorage';
import { StateEventBus } from '../utils/stateEventBus';
import {
  EnchantmentEntry,
  EntityEntry,
  FluidEntry,
  ModEntry,
  ZSRCFile,
} from './rcFile';
import { defaultSettings } from './setting';
import { ZenParsedFile } from './zenParsedFile';

class Global {
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

  constructor() {
    this.reset();
  }

  reset() {
    this.bus = new StateEventBus();

    this.isProject = false;
    this.baseFolder = '';

    this.setting = defaultSettings;
    this.documentSettings = new Map();

    this.rcFile = undefined;
    this.directory = {};

    this.mods = new Map();
    this.items = new RCStorage('item', 3);
    this.enchantments = new Map();
    this.entities = new Map();
    this.fluids = new Map();
    this.packages = {};
    this.global = new Map();
    this.globalFunction = new Map();

    this.zsFiles = new Map();
  }
}

export const zGlobal = new Global();
