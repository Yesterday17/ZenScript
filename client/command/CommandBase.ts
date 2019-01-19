import { LanguageClient } from "vscode-languageclient";
import { ExtensionContext, commands } from "vscode";

/**
 * Base class of all vscode commands.
 */
export abstract class CommandBase {
  protected client: LanguageClient;

  protected abstract command: string;
  protected abstract handler: () => void;

  public register(cli: LanguageClient, context: ExtensionContext) {
    this.client = cli;
    context.subscriptions.push(
      commands.registerCommand(this.command, this.handler)
    );
  }
}
