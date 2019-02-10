import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { zGlobal } from '../../api/global';
import { IBracketHandler } from '../../api/IBracketHandler';
import { ItemEntry } from '../../api/rcFile';
import { BracketHandlerKind } from './bracketHandlers';

class Item implements IBracketHandler {
  name = 'item';
  handler: CompletionItem = {
    label: this.name,
    detail: 'Access Items.',
    documentation: {
      kind: 'markdown',
      value:
        "The Item Bracket Handler gives you access to the Items in the game. It is only possible to get items registered in the game, so adding or removing mods may cause issues if you reference the mod's items in an ITem Bracket Handler.  \n" +
        'Items are referenced in the Item Bracket Handler by like so:  \n' +
        '```\n' +
        '<item:modid:itemname>\n' +
        '```\n' +
        'With the `modid` being the modid of the mod that the Item belongs to, and `itemname` being the name of the item, It is recommended to use `/ct hand` to get the correct name of the item.  \n' +
        'Generally it is like this though:  \n' +
        '```\n' +
        '<item:modid:itemname:meta>\n' +
        '```\n' +
        'With `item` as first entry, it specifically says "This has to be an item!" to CT.  \n' +
        "Although it's optional, we highly recomend you to add this, make auto completion available.  \n" +
        'Usually you will never need this, unless dealing with several custom bracket handlers.  \n' +
        '`modid` is the modid of the mod that the Item belongs to.  \n' +
        '`itemname` is the name of the item, use /ct hand to get the correct name.  \n' +
        '`meta` is the meta value of the item (e.g. Damage value, types, etc.). This is an Integer.  \n' +
        'You can also use a wildcard `*` to address all meta values.  \n' +
        'Also optional: If left out it will be 0.  \n\n' +
        'Normally, this will return an IItemStack Object.  \n' +
        'Please refer to [the respective wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Items/IItemStack/)' +
        ' for further information.',
    },
  };

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // item:[modid]
        const result = zGlobal.items.keys.map(key => {
          return {
            label: key,
            kind: BracketHandlerKind,
            data: {
              predecessor,
              triggerCharacter: ':',
              completion: 1,
            },
          } as CompletionItem;
        });
        return result;
      case 2:
        // item:modid:[item]
        return zGlobal.items.has(predecessor[1])
          ? zGlobal.items.getStorage(predecessor[1]).values.map((item, i) => {
              return {
                label:
                  item.slice(item.length - 2) === ':0'
                    ? item.slice(0, item.length - 2)
                    : item,
                kind: CompletionItemKind.Value,
                data: {
                  predecessor,
                  triggerCharacter: ':',
                  completion: 2,
                  item: [...predecessor.slice(1), item].join(':'),
                },
              } as CompletionItem;
            })
          : [];
      case 3:
        // item:modid:item:[metadata]
        return zGlobal.items.has(predecessor.slice(1).join(':'))
          ? zGlobal.items
              .getStorage(predecessor.slice(1).join(':'))
              .values.map((item, i) => {
                return {
                  label: item,
                  kind: CompletionItemKind.Value,
                  data: {
                    predecessor,
                    triggerCharacter: ':',
                    completion: 3,
                    item: [...predecessor.slice(1), item].join(':'),
                  },
                } as CompletionItem;
              })
          : [];
      default:
        return [];
    }
  }

  detail(item: CompletionItem): CompletionItem {
    switch (item.data.completion) {
      case 1:
        // item:[modid]
        if (!zGlobal.mods.has(item.label)) {
          // For example, minecraft
          // TODO: Add description for minecraft.
          return item;
        }
        const mod = zGlobal.mods.get(item.label);
        return {
          ...item,
          detail: mod.name,
          documentation: {
            kind: 'markdown',
            value: mod.description,
          },
        };
      case 2:
      case 3:
        // item:modid:[item]:[metadata];
        const itemFound: ItemEntry = zGlobal.items.get(
          item.data.item
        ) as ItemEntry;
        return {
          ...item,
          detail: itemFound.name,
          documentation: {
            kind: 'markdown',
            value:
              `UnlocalizedName: ${itemFound.unlocalizedName}  \n` +
              `MaxStackSize: ${itemFound.maxStackSize}  \n` +
              `MaxDamage: ${itemFound.maxDamage}  \n` +
              `CanRepair: ${itemFound.canRepair}  \n` +
              `Tooltips:  \n${itemFound.tooltips.join('  \n')}`,
          },
        };
      default:
        return item;
    }
  }
}

export const ItemBracketHandler = new Item();
