import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import {
  PriorityTreeGetRequestType,
  PriorityTreeItem,
} from '../../api/requests/PriorityTreeRequest';

export class PriorityTreeGetRequest {
  static onRequest(connection: Connection): void {
    connection.onRequest(PriorityTreeGetRequestType, () => {
      return Array.from(zGlobal.zsFiles.values())
        .map((file) => {
          return {
            name: file.name,
            path: file.path,
            priority: file.priority,
          } as PriorityTreeItem;
        })
        .sort((a, b) => {
          const priorityCompare = b.priority - a.priority;
          if (priorityCompare !== 0) {
            return priorityCompare;
          } else {
            return a.name > b.name ? 1 : -1;
          }
        });
    });
  }
}
