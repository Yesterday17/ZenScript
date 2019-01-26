import { Connection } from 'vscode-languageserver';
import { HistoryEntryAddRequest } from './HistoryEntryAddRequest';
import { HistoryEntryGetRequest } from './HistoryEntryGetRequest';
import { PriorityTreeGetRequest } from './PriorityTreeGetRequest';

const Requests = [
  HistoryEntryAddRequest,
  HistoryEntryGetRequest,
  PriorityTreeGetRequest,
];

export function applyRequests(connection: Connection) {
  Requests.forEach(req => req.onRequest(connection));
}
