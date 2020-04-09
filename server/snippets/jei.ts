import { Snippet } from './snippet';
import { CompletionItemKind } from 'vscode-languageserver';

export const JEI: Snippet = {
  mods: ['jei'],
  snippets: [
    {
      label: 'jh',
      filterText: 'mods.jei.JEI.hide',
      insertText: 'mods.jei.JEI.hide($0);',
      commitCharacters: ['<'],
    },
    {
      label: 'jrh',
      filterText: 'mods.jei.JEI.removeAndHide',
      insertText: 'mods.jei.JEI.removeAndHide($1);$0',
      commitCharacters: ['<'],
    },
    {
      label: 'jai',
      filterText: 'mods.jei.JEI.addItem',
      insertText: 'mods.jei.JEI.addItem($1);$0',
      commitCharacters: ['<'],
    },
    {
      label: 'jad',
      filterText: 'mods.jei.JEI.addDescription',
      insertText: 'mods.jei.JEI.addDescription($1, "$2");$0',
      commitCharacters: ['<'],
    },
    {
      label: 'jhc',
      filterText: 'mods.jei.JEI.hideCategory',
      insertText: 'mods.jei.JEI.hideCategory("$1");$0',
    },
  ],
};
