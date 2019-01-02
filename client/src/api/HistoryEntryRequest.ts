import { RequestType0, RequestType } from "vscode-jsonrpc";

export interface HistoryEntryItem {
  element: string;
  usage: number;
}

export const HistoryEntryGetRequest: RequestType0<
  HistoryEntryItem[],
  any,
  any
> = new RequestType0("zenscript/getHistoryEntries");

export const HistoryEntryAddRequest: RequestType<
  string,
  HistoryEntryItem[],
  any,
  any
> = new RequestType("zenscript/addHistoryEntry");
