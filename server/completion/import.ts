import get from 'get-value';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { Directory } from '../api';
import { zGlobal } from '../api/global';

function getKind(obj: any, k: string): CompletionItemKind {
  if (typeof obj[k] === 'string') {
    if (obj[k] === 'function') {
      return CompletionItemKind.Function;
    } else if (obj[k] === 'class') {
      return CompletionItemKind.Class;
    } else if (obj[k] === 'static') {
      return CompletionItemKind.Constant;
    } else {
      // global
      return CompletionItemKind.Variable;
    }
  } else {
    // Folder or file
    const d = obj[k] as Directory;
    for (const f in d) {
      if (typeof d[f] === 'string') {
        return CompletionItemKind.File;
      } else {
        return CompletionItemKind.Module;
      }
    }
  }
}

export function ImportCompletion(prev: string[]): CompletionItem[] {
  let packages: { [key: string]: any }, local: Directory;
  if (prev.length === 0) {
    packages = zGlobal.packages;
    local = zGlobal.directory;
  } else {
    packages = get(zGlobal.packages, prev);
    local = get(zGlobal.directory, prev);
  }

  const result = [];
  if (typeof packages === 'object') {
    result.push(
      ...Object.keys(packages)
        .filter(
          (k) =>
            !(
              'type' in packages[k] &&
              'body' in packages[k] &&
              'static' in packages[k]
            )
        )
        .map((k) => {
          return {
            label: k,
            kind: getKind(packages, k),
            commitCharacters: ['.', ';'],
          };
        })
    );
  }
  if (typeof local === 'object') {
    result.push(
      ...Object.keys(local).map((k) => {
        return {
          label: k,
          kind: getKind(local, k),
          commitCharacters: ['.', ';'],
        };
      })
    );
  }

  return result;
}
