import { Connection } from 'vscode-languageserver';
import { HistoryEntryAddRequest } from './HistoryEntryAddRequest';
import { HistoryEntryGetRequest } from './HistoryEntryGetRequest';
import { PriorityTreeGetRequest } from './PriorityTreeGetRequest';
import { ServerStatusGetRequest } from './ServerStatusRequest';

const Requests = [
  HistoryEntryAddRequest,
  HistoryEntryGetRequest,
  PriorityTreeGetRequest,
  ServerStatusGetRequest,
];

export function applyRequests(connection: Connection) {
  Requests.forEach((req) => req.onRequest(connection));
}
