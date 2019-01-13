import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { IBracketHandler } from "../../api/IBracketHandler";
import { zGlobal } from "../../api/global";
import { BracketHandlerKind } from "./bracketHandlers";

class Liquid implements IBracketHandler {
  handler: CompletionItem;
  constructor(alias: string) {
    this.handler = {
      label: alias,
      detail: "Access liquids.",
      documentation: {
        kind: "markdown",
        value:
          "The liquid Bracket Handler gives you access to the liquids in the game. It is only possible to get liquids registered in the game, so adding or removing mods may cause issues if you reference the mod's liquids in an liquid Bracket Handler.  \n" +
          "Liquids are referenced in the Liquid Bracket Handler by like so:  \n" +
          "```\n" +
          "<liquid:liquidname> OR <fluid:liquidname>\n" +
          "\n" +
          "<liquid:lava> OR <fluid:lava>\n" +
          "```\n" +
          "If the liquid is found, this will return an ILiquidStack Object.  \n" +
          "Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Liquids/ILiquidStack/)" +
          " for further information on what you can do with these."
      }
    };
  }

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // liquid:[modid]
        const result = Array.from(zGlobal.fluids.keys()).map(key => {
          return {
            label: key,
            kind: BracketHandlerKind,
            data: {
              triggerCharacter: ":",
              predecessor
            }
          } as CompletionItem;
        });
        return result;
      case 2:
        // liquid:modid:[liquid]
        return zGlobal.fluids.has(predecessor[1])
          ? zGlobal.fluids.get(predecessor[1]).map((fluid, i) => {
              return {
                label: fluid.name,
                kind: CompletionItemKind.Value,
                data: {
                  triggerCharacter: ":",
                  predecessor,
                  position: i
                }
              } as CompletionItem;
            })
          : [];
      default:
        return [];
    }
  }

  detail(item: CompletionItem): CompletionItem {
    switch (item.data.predecessor.length) {
      case 1:
        // liquid:[modid]
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
            kind: "markdown",
            value: mod.description
          }
        };
      case 2:
        // liquid:modid:[liquid]
        const liquidFound = zGlobal.fluids.get(item.data.predecessor[1])[
          item.data.position
        ];
        return {
          ...item,
          detail: liquidFound.name,
          documentation: {
            kind: "markdown",
            value:
              `UnlocalizedName: ${liquidFound.unlocalizedName}  \n` +
              `Rarity: ${liquidFound.rarity}  \n` +
              `Density: ${liquidFound.density}  \n` +
              `Color: ${liquidFound.color}  \n`
          }
        };
      default:
        return item;
    }
  }
}

export const LiquidBracketHandler = new Liquid("liquid");
export const FluidBracketHandler = new Liquid("fluid");
