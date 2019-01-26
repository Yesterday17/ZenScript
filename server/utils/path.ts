import Uri from 'vscode-uri';
import * as path from 'path';

export function ZSBaseName(uri: string): string {
  return path.basename(Uri.parse(uri).fsPath);
}
