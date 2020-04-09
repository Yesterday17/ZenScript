import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { JEI } from './jei';
import { Snippet } from './snippet';

const Snippets: Snippet[] = [JEI];

export function SnippetCompletions(): CompletionItem[] {
  const result: CompletionItem[] = [];

  Snippets.forEach((s) => {
    for (const mod of s.mods) {
      if (!zGlobal.mods.has(mod)) {
        return;
      }
    }
    result.push(
      ...s.snippets.map((s) => {
        s.kind = CompletionItemKind.Snippet;
        s.insertTextFormat = InsertTextFormat.Snippet;
        return s;
      })
    );
  });

  return result;
}
