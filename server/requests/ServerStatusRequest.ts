import { Connection } from 'vscode-languageserver';
import { ServerStatusRequestType } from '../../api/requests/ServerStatusRequest';
import { zGlobal } from '../api/global';

export class ServerStatusGetRequest {
  static onRequest(connection: Connection) {
    connection.onRequest(ServerStatusRequestType, async () => {
      await zGlobal.bus.wait('rc-loaded');
      await zGlobal.bus.wait('all-zs-parsed');
      return;
    });
  }
}
