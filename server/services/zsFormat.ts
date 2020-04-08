import {
  DocumentFormattingParams,
  InitializeResult,
  TextEdit,
} from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptFormat implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return (
      !!client.capability.textDocument &&
      !!client.capability.textDocument.formatting
    );
  }

  apply(service: InitializeResult): void {
    service.capabilities.documentFormattingProvider = true;
    zGlobal.conn.onDocumentFormatting(ZenScriptFormat.doFormat);
  }

  static doFormat(format: DocumentFormattingParams): Promise<TextEdit[]> {
    // TODO: Support ZenScript Formatting
    return null;
  }
}
