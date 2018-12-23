import Uri from "vscode-uri";
import { TextDocumentPositionParams } from "vscode-languageserver";

/**
 * Gets the filePath from uri.
 *
 * Inspired by https://github.com/tomi/vscode-rf-language-server
 * @param uri
 */
export function filePathFromUri(uri: string): string {
  return Uri.parse(uri).fsPath;
}

/**
 * Gets textPosition.
 *
 * @param position
 */
export function textPositionToLocation(position: TextDocumentPositionParams) {
  const filePath = filePathFromUri(position.textDocument.uri);

  return {
    filePath,
    position: {
      line: position.position.line,
      column: position.position.character
    }
  };
}
