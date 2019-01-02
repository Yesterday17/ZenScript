import { Connection } from "vscode-languageserver";
import { HistoryEntryAddRequest } from "./HistoryEntryAddRequest";
import { HistoryEntryGetRequest } from "./HistoryEntryGetRequest";

const Requests = [HistoryEntryAddRequest, HistoryEntryGetRequest];

export function applyRequests(connection: Connection) {
  Requests.forEach(req => req.onRequest(connection));
}
