import { RequestType, RequestType0 } from "vscode-jsonrpc";

export interface HistoryEntryItem {
  element: string;
  usage: number;
}

export const HistoryEntryGetRequestType: RequestType0<
  HistoryEntryItem[],
  any,
  any
> = new RequestType0("zenscript/getHistoryEntries");

export const HistoryEntryAddRequestType: RequestType<
  string,
  HistoryEntryItem[],
  any,
  any
> = new RequestType("zenscript/addHistoryEntry");
