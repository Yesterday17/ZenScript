import { RequestType0 } from 'vscode-jsonrpc';

export interface PriorityTreeItem {
  name: string;
  path: string;
  priority: number;
}

export const PriorityTreeGetRequestType: RequestType0<
  PriorityTreeItem[],
  any,
  any
> = new RequestType0('zenscript/getPriorityTree');
