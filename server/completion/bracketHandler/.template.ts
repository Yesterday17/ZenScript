/**
 * This is a template for ANY new BracketHandlers.
 *
 * This handler will NEVER be imported.
 */

import { CompletionItem } from 'vscode-languageserver';
import { IBracketHandler } from '../../api/IBracketHandler';

class Template implements IBracketHandler {
  handler: CompletionItem = {
    label: 'TemplateBracketHandler',
    detail: 'Access xxx.',
    documentation: {
      kind: 'markdown',
      value:
        'The Template Bracket Handler gives you access to xxxxx.  \n' +
        'XXXX are referenced in the XXX Bracket Handler by like so:  \n' +
        '```\n' +
        '<TemplateBracketHandler:name>\n' +
        '\n' +
        '<TemplateBracketHandler:misc>\n' +
        '```\n' +
        '.....'
    }
  };

  next(predecessor: string[]): CompletionItem[] {
    return [];
  }

  detail(item: CompletionItem): CompletionItem {
    return item;
  }
}

export const TemplateBracketHandler = new Template();
