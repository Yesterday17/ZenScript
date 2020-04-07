import { RequestType0 } from 'vscode-jsonrpc';

export const ServerStatusRequestType: RequestType0<
  boolean,
  any,
  any
> = new RequestType0('zenscript/serverStatus');
