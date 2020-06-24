import { DidChangeConfigurationNotification } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { ClientInfo, ZenScriptInitializedService } from './zsService';

export class ZenScriptDocumentConfigChange
  implements ZenScriptInitializedService {
  test(client: ClientInfo): boolean {
    return (
      !!client.capability.workspace &&
      !!client.capability.workspace.configuration
    );
  }
  apply(): void {
    zGlobal.conn?.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );

    zGlobal.conn?.onDidChangeConfiguration(() => {
      zGlobal.documentSettings.clear();
      // TODO: Now it's not necessary to revalidate documents after config change
      //       But maybe we'll need it in the future
      //       So leave it here.
      // zGlobal.documents.all().forEach(validateTextDocument);
    });
  }
}
