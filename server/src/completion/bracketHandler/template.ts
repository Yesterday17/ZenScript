/**
 * This is a template for ANY new BracketHandlers.
 */

import { CompletionItem } from "vscode-languageserver";

export const TemplateBracketHandler: CompletionItem = {
  label: "TemplateBracketHandler",
  detail: "Access xxx in the game.",
  documentation: {
    kind: "markdown",
    value:
      "The Template Bracket Handler gives you access to xxxxx.  \n" +
      "XXXX are referenced in the XXX Bracket Handler by like so:  \n" +
      "```\n" +
      "<TemplateBracketHandler:name>\n" +
      "\n" +
      "<TemplateBracketHandler:misc>\n" +
      "```\n" +
      "....."
  }
};
