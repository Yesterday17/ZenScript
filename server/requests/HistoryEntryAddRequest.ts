import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { HistoryEntryAddRequestType } from '../../api/requests/HistoryEntryRequest';
import { HistoryEntries } from '../utilities/historyEntry';

export class HistoryEntryAddRequest {
  static onRequest(connection: Connection): void {
    connection.onRequest(HistoryEntryAddRequestType, (entry) => {
      HistoryEntries.add(entry);
      return HistoryEntries.entries.slice(
        0,
        zGlobal.setting?.maxHistoryEntries
      );
    });
  }
}
