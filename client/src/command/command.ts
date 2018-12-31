import { LanguageClient } from "vscode-languageclient";
import { ExtensionContext, commands } from "vscode";

export abstract class CommandBase {
  private client: LanguageClient;

  protected abstract command: string;
  protected abstract handler: () => void;

  public register(cli: LanguageClient, context: ExtensionContext) {
    this.client = cli;
    context.subscriptions.push(
      commands.registerCommand(this.command, this.handler)
    );
  }
}
