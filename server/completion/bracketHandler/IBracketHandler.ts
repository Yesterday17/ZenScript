import { CompletionItem } from 'vscode-languageserver';

export interface IBracketHandler {
  name: string;
  handler: CompletionItem;

  check: (predecessor: string[]) => boolean;
  next: (predecessor: string[]) => CompletionItem[];
  detail: (item: CompletionItem) => CompletionItem;
}
