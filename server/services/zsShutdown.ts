import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';

export class ZenScriptShutdown {
  static register(connection: Connection) {
    connection.onShutdown(ZenScriptShutdown.onShutdown);
  }

  static onShutdown() {
    zGlobal.reset();
  }
}
