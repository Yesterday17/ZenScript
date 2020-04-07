import { InitializeResult } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { ZenScriptActiveService } from './zsService';

export class ZenScriptShutdown extends ZenScriptActiveService {
  apply(service: InitializeResult): void {
    zGlobal.conn.onShutdown(ZenScriptShutdown.onShutdown);
  }

  static onShutdown() {
    zGlobal.reset();
  }
}
