import {
  CompletionItem,
  CompletionParams,
  InitializeResult,
} from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { PreProcessorCompletions } from '../completion/preprocessor/preprocessors';
import { findToken } from '../utils/findToken';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptBasicCompletion implements ZenScriptService {
  /**
   * Support basic #preprocessor when no folder is open
   */
  test(client: ClientInfo): boolean {
    return (
      !client.isFolder &&
      !!client.capability.textDocument &&
      !!client.capability.textDocument.completion &&
      !!client.capability.textDocument.completion.completionItem
    );
  }

  apply(service: InitializeResult): void {
    if (!service.capabilities.completionProvider) {
      service.capabilities.completionProvider = {
        resolveProvider: false,
        triggerCharacters: [],
      };
    }
    // #preprocessor
    service.capabilities.completionProvider.triggerCharacters.push('#');
    zGlobal.conn.onCompletion(ZenScriptBasicCompletion.doCompletion);
  }

  static async doCompletion(c: CompletionParams): Promise<CompletionItem[]> {
    await zGlobal.bus.wait('all-zs-parsed');

    const document = zGlobal.documents.get(c.textDocument.uri);
    const offset = document.offsetAt(c.position);

    let trigger = c.context.triggerCharacter;
    if (!trigger) {
      const token = findToken(
        zGlobal.zsFiles.get(document.uri).comments,
        offset - 1
      );
      if (token.exist && token.found.token.image === '#') {
        trigger = token.found.token.image;
      }
    }

    if (trigger === '#') {
      return PreProcessorCompletions;
    }
    return [];
  }
}
