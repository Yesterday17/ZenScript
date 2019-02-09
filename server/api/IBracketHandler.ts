import { CompletionItem } from 'vscode-languageserver';

export interface IBracketHandler {
  name: string;
  handler: CompletionItem;
  next: (predecessor: string[]) => CompletionItem[];
  detail: (item: CompletionItem) => CompletionItem;
}
