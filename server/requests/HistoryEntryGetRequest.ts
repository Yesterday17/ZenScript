import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { HistoryEntryGetRequestType } from '../../api/requests/HistoryEntryRequest';
import { HistoryEntries } from '../utilities/historyEntry';

// TODO: implement RequestBase when the [feature](https://github.com/Microsoft/TypeScript/issues/14600) is available.
export class HistoryEntryGetRequest /* implements RequestBase */ {
  static onRequest(connection: Connection) {
    connection.onRequest(HistoryEntryGetRequestType, () => {
      return HistoryEntries.entries.slice(0, zGlobal.setting.maxHistoryEntries);
    });
  }
}
