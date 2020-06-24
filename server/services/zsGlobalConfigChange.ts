import { InitializeResult } from 'vscode-languageserver';
import { ZenScriptSettings } from '../api';
import { zGlobal } from '../api/global';
import { defaultSettings } from '../api/setting';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptGlobalConfigChange implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return (
      !client.capability.workspace || !client.capability.workspace.configuration
    );
  }

  apply(service: InitializeResult): void {
    zGlobal.conn?.onDidChangeConfiguration((change) => {
      zGlobal.setting = <ZenScriptSettings>(
        (change.settings.zenscript || defaultSettings)
      );
      // TODO: Now it's not necessary to revalidate documents after config change
      //       But maybe we'll need it in the future
      //       So leave it here.
      // zGlobal.documents.all().forEach(validateTextDocument);
    });
  }
}
