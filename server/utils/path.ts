import { posix } from 'path';
import { Connection } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import * as fs from '../utils/fs';

export function join(uri: URI, ...append: string[]): URI {
  return URI.from({
    scheme: uri.scheme,
    authority: uri.authority,
    path: posix.join(uri.path, ...append),
    query: uri.query,
    fragment: uri.fragment,
  });
}

export function basename(uri: URI): string {
  return posix.basename(uri.path);
}

export async function AllZSFiles(
  dPath: URI,
  connection: Connection,
  pkg: string
): Promise<{ uri: URI; pkg: string }[]> {
  const result: { uri: URI; pkg: string }[] = [];
  const data = await fs.readDirectory(dPath, connection);
  for (const [name, type] of data) {
    const content = join(dPath, name);
    if (fs.isFile(type) && posix.extname(name) === '.zs') {
      result.push({
        uri: content,
        pkg: pkg + '.' + name.substr(0, name.length - 3),
      });
    } else if (fs.isDirectory(type)) {
      result.push(...(await AllZSFiles(content, connection, pkg + '.' + name)));
    }
  }
  return result;
}
