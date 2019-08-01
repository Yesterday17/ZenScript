import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { IBracketHandler } from '../../api/IBracketHandler';
import { zGlobal } from '../../api/global';
import { BracketHandlerKind } from './bracketHandlers';

class Liquid implements IBracketHandler {
  name: string;
  handler: CompletionItem;
  constructor(alias: string) {
    this.name = alias;
    this.handler = {
      label: alias,
      detail: 'Access liquids.',
      documentation: {
        kind: 'markdown',
        value:
          "The liquid Bracket Handler gives you access to the liquids in the game. It is only possible to get liquids registered in the game, so adding or removing mods may cause issues if you reference the mod's liquids in an liquid Bracket Handler.  \n" +
          'Liquids are referenced in the Liquid Bracket Handler by like so:  \n' +
          '```\n' +
          '<liquid:liquidname> OR <fluid:liquidname>\n' +
          '\n' +
          '<liquid:lava> OR <fluid:lava>\n' +
          '```\n' +
          'If the liquid is found, this will return an ILiquidStack Object.  \n' +
          'Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Liquids/ILiquidStack/)' +
          ' for further information on what you can do with these.',
      },
    };
  }

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // liquid:[liquid]
        const result = Array.from(zGlobal.fluids.keys()).map(key => {
          const fluid = zGlobal.fluids.get(key);
          return {
            label: fluid.name,
            filterText: [
              fluid.name,
              fluid.unlocalizedName,
              fluid.resourceLocation.path,
            ].join(''),
            kind: CompletionItemKind.Value,
            data: {
              triggerCharacter: ':',
              predecessor,
              key,
            },
          } as CompletionItem;
        });
        return result;
      default:
        return [];
    }
  }

  detail(item: CompletionItem): CompletionItem {
    switch (item.data.predecessor.length) {
      case 1:
        // liquid:[liquid]
        const fluid = zGlobal.fluids.get(item.data.key);
        return {
          ...item,
          detail: fluid.name,
          documentation: {
            kind: 'markdown',
            value:
              `UnlocalizedName: ${fluid.unlocalizedName}  \n` +
              `Rarity: ${fluid.rarity}  \n` +
              `Density: ${fluid.density}  \n` +
              `Color: ${fluid.color}  \n`,
          },
        };
      default:
        return item;
    }
  }
}

export const LiquidBracketHandler = new Liquid('liquid');
export const FluidBracketHandler = new Liquid('fluid');
