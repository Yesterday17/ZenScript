import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { zGlobal } from '../api/global';

export function GlobalCompletion(): CompletionItem[] {
  return [
    ...Array.from(zGlobal.global.keys()).map((g) => {
      return {
        label: g,
        kind: CompletionItemKind.Constant,
      } as CompletionItem;
    }),
    ...Array.from(zGlobal.globalFunction.keys()).map((g) => {
      return {
        label: g,
        kind: CompletionItemKind.Function,
      } as CompletionItem;
    }),
    { label: 'import', kind: CompletionItemKind.Keyword },
    { label: 'zenClass', kind: CompletionItemKind.Keyword },
    { label: 'var', kind: CompletionItemKind.Keyword },
    { label: 'val', kind: CompletionItemKind.Keyword },
    { label: 'global', kind: CompletionItemKind.Keyword },
    { label: 'static', kind: CompletionItemKind.Keyword },
    { label: 'function', kind: CompletionItemKind.Keyword },
  ];
}
