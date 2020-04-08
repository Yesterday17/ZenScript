import { LanguageClient } from 'vscode-languageclient';
import { ServerStatusRequestType } from '../../api/requests/ServerStatusRequest';
import { StatusBar } from '../view/statusbar';

export class StatusBarRequest {
  static onRequest(client: LanguageClient) {
    client.onRequest(ServerStatusRequestType, (ok) => {
      StatusBar.show();
      StatusBar.check(ok);
    });
  }
}
