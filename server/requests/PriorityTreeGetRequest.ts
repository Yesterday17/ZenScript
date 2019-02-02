import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import {
  PriorityTreeGetRequestType,
  PriorityTreeItem,
} from '../../api/requests/PriorityTreeRequest';

// TODO: implement RequestBase when the [feature](https://github.com/Microsoft/TypeScript/issues/14600) is available.
export class PriorityTreeGetRequest /* implements RequestBase */ {
  static onRequest(connection: Connection) {
    connection.onRequest(PriorityTreeGetRequestType, () => {
      return Array.from(zGlobal.zsFiles.values())
        .map(file => {
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
