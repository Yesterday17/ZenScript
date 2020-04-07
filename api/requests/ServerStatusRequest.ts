import { RequestType } from 'vscode-jsonrpc';

export const ServerStatusRequestType: RequestType<
  boolean,
  null,
  null,
  null
> = new RequestType('zenscript/serverStatus');
