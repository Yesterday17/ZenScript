import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { IBracketHandler } from "../../api/IBracketHandler";
import { zGlobal } from "../../api/global";
import { BracketHandlerKind } from "./bracketHandlers";

class Item implements IBracketHandler {
  handler: CompletionItem = {
    label: "item",
    detail: "Access Items.",
    documentation: {
      kind: "markdown",
      value:
        "The Item Bracket Handler gives you access to the Items in the game. It is only possible to get items registered in the game, so adding or removing mods may cause issues if you reference the mod's items in an ITem Bracket Handler.  \n" +
        "Items are referenced in the Item Bracket Handler by like so:  \n" +
        "```\n" +
        "<item:modid:itemname>\n" +
        "```\n" +
        "With the `modid` being the modid of the mod that the Item belongs to, and `itemname` being the name of the item, It is recommended to use `/ct hand` to get the correct name of the item.  \n" +
        "Generally it is like this though:  \n" +
        "```\n" +
        "<item:modid:itemname:meta>\n" +
        "```\n" +
        'With `item` as first entry, it specifically says "This has to be an item!" to CT.  \n' +
        "Although it's optional, we highly recomend you to add this, make auto completion available.  \n" +
        "Usually you will never need this, unless dealing with several custom bracket handlers.  \n" +
        "`modid` is the modid of the mod that the Item belongs to.  \n" +
        "`itemname` is the name of the item, use /ct hand to get the correct name.  \n" +
        "`meta` is the meta value of the item (e.g. Damage value, types, etc.). This is an Integer.  \n" +
        "You can also use a wildcard `*` to address all meta values.  \n" +
        "Also optional: If left out it will be 0.  \n\n" +
        "Normally, this will return an IItemStack Object.  \n" +
        "Please refer to [the respective wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Items/IItemStack/)" +
        " for further information."
    }
  };

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // item:[modid]
        const result = Array.from(zGlobal.items.keys()).map(key => {
          return {
            label: key,
            kind: BracketHandlerKind
          } as CompletionItem;
        });
        return result;
      case 2:
        // item:modid:[item]
        return zGlobal.items.has(predecessor[1])
          ? zGlobal.items.get(predecessor[1]).map(item => {
              return {
                label: item.path,
                kind: CompletionItemKind.Value
              } as CompletionItem;
            })
          : [];
      default:
        return [];
    }
  }
}

export const ItemBracketHandler = new Item();
