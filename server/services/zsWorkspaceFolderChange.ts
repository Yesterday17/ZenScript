import { zGlobal } from '../api/global';
import { ClientInfo, ZenScriptInitializedService } from './zsService';

export class ZenScriptWorkspaceFolderChange
  implements ZenScriptInitializedService {
  test(client: ClientInfo): boolean {
    return (
      client.capability.workspace &&
      !!client.capability.workspace.workspaceFolders
    );
  }

  apply(): void {
    zGlobal.conn.workspace.onDidChangeWorkspaceFolders((_event) => {
      // TODO: reload
      zGlobal.console.log('Workspace folder change event received.');
    });
  }
}
