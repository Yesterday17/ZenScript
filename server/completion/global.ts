import { CompletionItem } from 'vscode';
import { CompletionItemKind } from 'vscode-languageserver';
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
  ];
}
