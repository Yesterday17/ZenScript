import { commands, ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { Registerable } from './Registerable';

/**
 * Base class of all vscode commands.
 */
export abstract class CommandBase implements Registerable {
  protected client: LanguageClient;

  protected abstract command: string;
  protected abstract handler: () => void;

  public register(client: LanguageClient, context: ExtensionContext) {
    this.client = client;
    context.subscriptions.push(
      commands.registerCommand(this.command, this.handler)
    );
  }
}
