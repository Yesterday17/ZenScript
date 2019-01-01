import { CompletionItem } from "vscode-languageserver";
import { IBracketHandler } from "../../api/IBracketHandler";

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
    return [];
  }

  detail(item: CompletionItem): CompletionItem {
    return { label: "" };
  }
}

export const LiquidBracketHandler = new Liquid("liquid");
export const FluidBracketHandler = new Liquid("fluid");
