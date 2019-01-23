import { Connection } from 'vscode-languageserver';

export interface RequestBase {
  onRequest(connection: Connection): any;
}
