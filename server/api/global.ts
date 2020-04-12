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

  isProject: boolean;
  baseFolderUri: URI;
  setting: ZenScriptSettings;
  documentSettings: Map<string, Promise<ZenScriptSettings>>;

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
    this.baseFolderUri = null;

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
