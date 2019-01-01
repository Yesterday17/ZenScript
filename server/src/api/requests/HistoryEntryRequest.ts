import { RequestType0 } from "vscode-jsonrpc";

export interface HistoryEntryItem {
  element: string;
  usage: number;
}

export const HistoryEntryRequest: RequestType0<
  HistoryEntryItem[],
  any,
  any
> = new RequestType0("zenscript/getHistoryEntries");
