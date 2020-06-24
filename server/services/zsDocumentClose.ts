import { InitializeResult } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { ZenScriptActiveService } from './zsService';

export class ZenScriptDocumentClose extends ZenScriptActiveService {
  apply(service: InitializeResult): void {
    // Delete configuration of closed documents.
    zGlobal.documents?.onDidClose((event) => {
      zGlobal.documentSettings.delete(event.document.uri);
    });
  }
}
