import { InitializeResult } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import * as path from '../utils/path';
import { reloadRCFile } from '../utils/zsrcFile';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptRCChange implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return (
      !!client.capability.workspace &&
      !!client.capability.workspace.didChangeWatchedFiles
    );
  }

  apply(service: InitializeResult): void {
    // 当 Watch 的文件确实发生变动
    zGlobal.conn.onDidChangeWatchedFiles(async (change) => {
      if (zGlobal.isProject) {
        for (const c of change.changes) {
          if (c.uri === path.join(zGlobal.baseFolderUri, '.zsrc').path) {
            reloadRCFile();
            break;
          }
        }
      }
    });
  }
}
