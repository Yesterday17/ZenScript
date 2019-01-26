import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { PriorityTreeGetRequestType } from '../../api/requests/PriorityTreeRequest';

// TODO: implement RequestBase when the [feature](https://github.com/Microsoft/TypeScript/issues/14600) is available.
export class PriorityTreeGetRequest /* implements RequestBase */ {
  static onRequest(connection: Connection) {
    connection.onRequest(PriorityTreeGetRequestType, () => {
      return Array.from(zGlobal.priority.values()).sort((a, b) => {
        const priorityCompare = a.priority - b.priority;
        if (priorityCompare !== 0) {
          return priorityCompare;
        } else {
          return a.name > b.name ? 1 : -1;
        }
      });
    });
  }
}
