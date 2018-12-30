import { CompletionItem } from "vscode-languageserver";

export const TemplateBracketHandler: CompletionItem = {
  label: "TemplateBracketHandler",
  detail:
    "The Detail of TemplateBracketHandler.",
  documentation: {
    kind: "markdown",
    value:
      "The Template Bracket Handler gives you access to xxxxx.  \n" +
      "```\n" +
      "<TemplateBracketHandler:name>\n" +
      "\n" +
      "<TemplateBracketHandler:misc>\n" +
      "```\n" + 
      "....."
  }
};
