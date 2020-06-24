/* eslint-disable @typescript-eslint/ban-types */
import {
  Connection,
  createConnection,
  ProposedFeatures,
  RemoteConsole,
  TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { Directory, ZenFunction, ZenScriptSettings } from '.';
import { ClientInfo } from '../services/zsService';
import { RCStorage } from '../utils/rcStorage';
import { StateEventBus } from '../utils/stateEventBus';
import {
  EnchantmentEntry,
  EntityEntry,
  FluidEntry,
  ItemEntry,
  ModEntry,
  ZSRCFile,
} from './rcFile';
import { ZenParsedFile } from './zenParsedFile';

class Global {
  ///////// Connection /////////
  /**
   * Current language server connection
   */
  conn: Connection;
  /**
   * Document manager
   */
  documents: TextDocuments<TextDocument>;
  /**
   * Subscribe-based event bus
   */
  bus: StateEventBus;

  /**
   * Client info, genereated by onInitialize
   */
  client: ClientInfo;

  ///////// Utils /////////
  /**
   * Connection console
   */
  console: RemoteConsole;

  isProject = false;
  baseFolderUri: URI;
  setting: ZenScriptSettings;
  documentSettings: Map<string, Promise<ZenScriptSettings>> = new Map();

  // .zsrc File
  rcFile: ZSRCFile;
  directory: Directory;

  mods: Map<string, ModEntry> = new Map();
  items: RCStorage<ItemEntry> = new RCStorage('item', 3);
  enchantments: Map<string, EnchantmentEntry[]> = new Map();
  entities: Map<string, EntityEntry[]> = new Map();
  fluids: Map<string, FluidEntry> = new Map();
  packages: Object;

  global: Map<string, Object> = new Map();
  globalFunction: Map<string, ZenFunction[]> = new Map();

  // zs file
  zsFiles: Map<string, ZenParsedFile> = new Map();

  constructor() {
    this.reset();
  }

  init() {
    // Create connection and use all LSP features
    this.conn = createConnection(ProposedFeatures.all);
    this.console = this.conn.console;

    // TextDocument Manager
    this.documents = new TextDocuments(TextDocument);
  }

  listen() {
    // listen zGlobal.connection to trigger events
    this.documents.listen(this.conn);
    this.conn.listen();
  }

  reset() {
    this.conn = undefined;
    this.documents = undefined;
    this.bus = new StateEventBus();

    this.isProject = false;
    this.baseFolderUri = undefined;

    this.setting = undefined;
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

    ///////// Utils /////////
    this.console = undefined;
  }

  ready(): boolean {
    return (
      this.conn !== undefined &&
      this.rcFile !== undefined &&
      this.console !== undefined
    );
  }
}

export const zGlobal = new Global();
