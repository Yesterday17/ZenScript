import { CompletionItem } from "vscode-languageserver";

export const CreativeTabBracketHandler: CompletionItem = {
  label: "creativetab",
  detail:
    "The Creative Tab Bracket Handler gives you access to the creative Tabs in the game.",
  documentation: {
    kind: "markdown",
    value:
      "The Creative Tab Bracket Handler gives you access to the creative Tabs in the game.  \n" +
      "They are referenced in the Creative Tab handler this way:  \n" +
      "```\n" +
      "<creativetab:name>\n" +
      "\n" +
      "<creativetab:misc>\n" +
      "```\n" +
      "If the Creative Tab is found, this will return an ICreativeTab Object.  \n" +
      "Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/CreativeTabs/ICreativeTab/)" +
      " for further information on what you can do with these.\n"
  }
};
