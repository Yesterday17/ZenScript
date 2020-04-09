import { CompletionItem } from 'vscode-languageserver';
import { IBracketHandler } from './IBracketHandler';

class CreativeTab implements IBracketHandler {
  name = 'creativetab';
  handler: CompletionItem = {
    label: this.name,
    detail: 'Access creative Tabs.',
    documentation: {
      kind: 'markdown',
      value:
        'The Creative Tab Bracket Handler gives you access to the creative Tabs in the game.  \n' +
        'They are referenced in the Creative Tab handler this way:  \n' +
        '```\n' +
        '<creativetab:name>\n' +
        '\n' +
        '<creativetab:misc>\n' +
        '```\n' +
        'If the Creative Tab is found, this will return an ICreativeTab Object.  \n' +
        'Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/CreativeTabs/ICreativeTab/)' +
        ' for further information on what you can do with these.\n',
    },
  };

  check(predecessor: string[]): boolean {
    return predecessor.length === 2;
  }

  next(predecessor: string[]): CompletionItem[] {
    return [];
  }

  detail(item: CompletionItem): CompletionItem {
    return item;
  }
}

export const CreativeTabBracketHandler = new CreativeTab();
