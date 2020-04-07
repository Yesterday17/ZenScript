import { Connection } from 'vscode-languageserver';
import { ServerStatusRequestType } from '../../api/requests/ServerStatusRequest';
import { zGlobal } from '../api/global';

export class ServerStatusGetRequest {
  static onRequest(connection: Connection) {
    connection.onRequest(ServerStatusRequestType, async () => {
      if (zGlobal.isProject && !zGlobal.bus.isFinished('rc-loaded')) {
        return false;
      }
      return zGlobal.bus.isFinished('all-zs-parsed');
    });
  }
}
