import { CompletionItemKind, CompletionItem } from "vscode-languageserver";
import { ZenScriptCompletion } from "./completion";

class BrewingCompletion extends ZenScriptCompletion {
  constructor() {
    super({
      label: "brewing",
      kind: CompletionItemKind.Field,
      detail: "Brewing Recipe Handler",
      documentation: {
        kind: "markdown",
        value:
          "You can access the Brewing Handler using the `brewing` global keyword."
      },
      data: { name: "brewing", level: 1 }
    });
  }
}

export const BrewingCompletionInstance = new BrewingCompletion();
