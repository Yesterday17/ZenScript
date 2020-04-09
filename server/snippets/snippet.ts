import { CompletionItem } from 'vscode-languageserver';

export interface Snippet {
  /**
   * A list of mods needed to enable this set of snippets.
   */
  mods: string[];

  /**
   * A list of snippets.
   */
  snippets: CompletionItem[];
}
