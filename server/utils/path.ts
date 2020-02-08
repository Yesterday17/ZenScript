import { readdirSync, statSync } from 'fs';
import * as path from 'path';
import { URI } from 'vscode-uri';

export function ZSBaseName(uri: string): string {
  return path.basename(URI.parse(uri).fsPath);
}

export function AllZSFiles(dPath: string): string[] {
  const result: string[] = [];
  readdirSync(dPath).forEach(file => {
    const content = path.resolve(dPath, file);
    const stat = statSync(content);
    if (stat.isFile() && path.extname(file) === '.zs') {
      result.push(content);
    } else if (stat.isDirectory()) {
      result.push(...AllZSFiles(content));
    }
  });
  return result;
}
