import {
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import { NAME, VERSION } from '../api/constants';
import { zGlobal } from '../api/global';
import { ZenScriptServices } from './services';
import { ClientInfo } from './zsService';

export class ZenScriptInitialize {
  static register(): void {
    zGlobal.conn.onInitialize(ZenScriptInitialize.doInit);
  }

  static doInit(init: InitializeParams): InitializeResult {
    const client = ZenScriptInitialize.parse(init);
    zGlobal.client = client;

    const result: InitializeResult = {
      serverInfo: { name: NAME, version: VERSION },
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Full,
      },
    };
    ZenScriptServices.forEach((s) => {
      if (s.test(client)) {
        s.apply(result);
      }
    });

    return result;
  }

  static parse(init: InitializeParams) {
    const client: ClientInfo = {
      info: 'unnamed',
      isFolder: false,
      folders: [],

      capability: init.capabilities,
    };
    if (init.clientInfo) {
      client.info = `${init.clientInfo.name}(${init.clientInfo.version})`;
    }

    // Support for deprecated rootPath
    if (init.rootPath) {
      client.isFolder = true;
      client.folders.push({
        name: 'unknown',
        uri: init.rootPath,
      });
    }

    // Support for deprecated rootUri
    if (init.rootUri) {
      client.isFolder = true;
      client.folders.push({
        name: 'unknown',
        uri: init.rootUri,
      });
    }

    // Proposed workspaceFolder
    if (init.workspaceFolders && init.workspaceFolders.length > 0) {
      client.isFolder = true;
      client.folders.push(...init.workspaceFolders);
    }

    return client;
  }
}
