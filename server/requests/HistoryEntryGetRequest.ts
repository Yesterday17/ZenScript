import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { HistoryEntryGetRequestType } from '../../api/requests/HistoryEntryRequest';
import { HistoryEntries } from '../utilities/historyEntry';

export class HistoryEntryGetRequest {
  static onRequest(connection: Connection): void {
    connection.onRequest(HistoryEntryGetRequestType, () => {
      return HistoryEntries.entries.slice(
        0,
        zGlobal.setting?.maxHistoryEntries
      );
    });
  }
}
