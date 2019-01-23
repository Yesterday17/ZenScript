import { LanguageClient } from 'vscode-languageclient';
import { ExtensionContext } from 'vscode';

export interface Registerable {
  register(client: LanguageClient, context: ExtensionContext): void;
}
