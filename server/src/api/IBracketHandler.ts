import { CompletionItem } from "vscode-languageserver";

export interface IBracketHandler {
  handler: CompletionItem;
  next: (predecessor: string[]) => CompletionItem[];
}
