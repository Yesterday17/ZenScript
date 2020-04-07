import { URL } from 'url';
import { InitializeResult } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
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
          // TODO: use relative path instead
          if (
            new URL(c.uri).hash === new URL(zGlobal.baseFolder + '/.zsrc').hash
          ) {
            reloadRCFile(zGlobal.conn);
            break;
          }
        }
      }
    });
  }
}
