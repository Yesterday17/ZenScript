import { CompletionItem } from 'vscode-languageserver';
import { IBracketHandler } from '../../api/IBracketHandler';

class Potion implements IBracketHandler {
  handler: CompletionItem = {
    label: 'potion',
    detail: 'Access Potions.',
    documentation: {
      kind: 'markdown',
      value:
        "The Potion Bracket Handler gives you access to the Potions in the game. It is only possible to get Potions registered in the game, so adding or removing mods may cause issues if you reference the mod's Potions in a Potion Bracket Handler.  \n" +
        'Potions are referenced in the Potion Bracket Handler like so:  \n' +
        '```\n' +
        '<potion:modname:potionname>\n' +
        '\n' +
        '<potion:minecraft:strength>\n' +
        '```\n' +
        'If the Potion is found, this will return an IPotion Object.  \n' +
        'Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Potions/IPotion/)' +
        ' for further information on what you can do with these.'
    }
  };

  next(predecessor: string[]): CompletionItem[] {
    return [];
  }

  detail(item: CompletionItem): CompletionItem {
    return item;
  }
}

export const PotionBracketHandler = new Potion();
