import { CompletionItem } from "vscode-languageserver";
import { IBracketHandler } from "../../api/IBracketHandler";

class Enchantment implements IBracketHandler {
  handler: CompletionItem = {
    label: "enchantment",
    detail: "Access Enchantment definitions.",
    documentation: {
      kind: "markdown",
      value:
        "The Enchantment Bracket Handler gives you access to the Enchantment definitions in the game.  \n" +
        "They are referenced in the Enchantment handler this way:  \n" +
        "```\n" +
        "<enchantment:modid:name>\n" +
        "\n" +
        "<enchantment:minecraft:protection>\n" +
        "```\n" +
        "If the Enchantment is found, this will return an IEnchantmentDefinition Object.  \n" +
        "Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Enchantments/IEnchantmentDefinition/)" +
        " for further information on what you can do with these."
    }
  };

  next(predecessor: string[]): CompletionItem[] {
    return [];
  }

  detail(item: CompletionItem): CompletionItem {
    return { label: "" };
  }
}

export const EnchantmentBracketHandler = new Enchantment();
