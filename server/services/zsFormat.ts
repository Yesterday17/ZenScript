import {
  Connection,
  DocumentFormattingParams,
  TextEdit,
} from 'vscode-languageserver';

export class ZenScriptFormat {
  static register(connection: Connection) {
    connection.onDocumentFormatting(ZenScriptFormat.doFormat);
  }

  static doFormat(
    format: DocumentFormattingParams
  ): Promise<TextEdit[] | undefined | null> {
    return null;
  }
}
