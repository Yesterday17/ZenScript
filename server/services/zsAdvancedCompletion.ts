import {
  CompletionItem,
  CompletionParams,
  InitializeResult,
} from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import {
  BracketHandlerMap,
  BracketHandlers,
  DetailBracketHandlers,
  SimpleBracketHandlers,
} from '../completion/bracketHandler/bracketHandlers';
import { ItemBracketHandler } from '../completion/bracketHandler/item';
import { GlobalCompletion } from '../completion/global';
import { ImportCompletion } from '../completion/import';
import { PreProcessorCompletions } from '../completion/preprocessor/preprocessors';
import { DOT, IMPORT } from '../parser/zsLexer';
import { findToken } from '../utils/findToken';
import { getdocumentSettings } from '../utils/setting';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptAdvancedCompletion implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return (
      client.isFolder &&
      !!client.capability.textDocument &&
      !!client.capability.textDocument.completion &&
      !!client.capability.textDocument.completion.completionItem
    );
  }
  apply(service: InitializeResult): void {
    if (!service.capabilities.completionProvider) {
      service.capabilities.completionProvider = {
        resolveProvider: true,
        triggerCharacters: [],
      };
    }
    // #preprocessor
    service.capabilities.completionProvider.triggerCharacters.push(
      '#',
      '.',
      ':',
      '<',
      ' '
    );
    zGlobal.conn.onCompletion(ZenScriptAdvancedCompletion.doCompletion);
    zGlobal.conn.onCompletionResolve(
      ZenScriptAdvancedCompletion.doCompletionResolve
    );
  }

  static async doCompletion(
    completion: CompletionParams
  ): Promise<CompletionItem[]> {
    await zGlobal.bus.wait('all-zs-parsed');

    // 获得当前正在修改的 document
    const document = zGlobal.documents.get(completion.textDocument.uri);
    // 当前补全的位置
    const position = completion.position;
    // 当前补全的 offset
    let offset = document.offsetAt(position);
    // 当前文档的文本
    const content = document.getText();
    // Tokens
    const tokens = zGlobal.zsFiles.get(document.uri).tokens;
    // triggerred automatically or manually
    const manuallyTriggerred =
      completion.context.triggerCharacter === undefined;

    let trigger = completion.context.triggerCharacter;
    if (manuallyTriggerred) {
      let s;
      do {
        offset--;
        s = document.getText({
          start: document.positionAt(offset),
          end: document.positionAt(offset + 1),
        });
      } while (s === ' ');
      let token = findToken(tokens, offset - 1);
      if (token.exist) {
        if (['#', '.', ':', '<'].includes(token.found.token.image)) {
          trigger = token.found.token.image;
        } else if (token.found.token.image === 'import') {
          trigger = ' ';
        } else {
          const prev = findToken(tokens, token.found.token.startOffset - 1);
          if (
            prev.exist &&
            ['#', '.', ':', '<'].includes(prev.found.token.image)
          ) {
            trigger = prev.found.token.image;
            offset = token.found.token.startOffset;
          }
        }
      } else {
        const token = findToken(
          zGlobal.zsFiles.get(document.uri).comments,
          offset - 1
        );
        if (token.exist && token.found.token.image === '#') {
          trigger = token.found.token.image;
        }
      }
    }

    // TODO: Finish AutoCompletion of `.`
    switch (trigger) {
      case '#':
        return PreProcessorCompletions;
      case ' ':
        // import<space>
        let s;
        do {
          offset--;
          s = document.getText({
            start: document.positionAt(offset),
            end: document.positionAt(offset + 1),
          });
        } while (s === ' ');
        let token = findToken(tokens, offset - 1);
        if (token.exist && token.found.token.image === 'import') {
          return ImportCompletion([]);
        }
        return [];
      case '.':
        // Find 'a.b.' when typing the last dot
        const now = findToken(tokens, offset - 1);
        if (!now.exist) {
          return [];
        }
        let pos,
          prev = [];
        for (
          pos = now.found.position;
          tokens[pos].tokenType === DOT;
          pos -= 2
        ) {
          prev.unshift(tokens[pos - 1].image);
        }
        if (tokens[pos].tokenType === IMPORT) {
          return ImportCompletion(prev);
        }
        break;
      case ':':
        // 位于 <> 内的内容
        let predecessor: string[] = [];

        // Find inBracket
        // TODO: Use Token instead.
        for (let i = offset - 1; i >= 0; i--) {
          // 当 : 与 < 不再同一行时直接返回 null
          if (content[i] === '\n') {
            return;
          }

          if (content[i] === '<') {
            predecessor = document
              .getText({
                start: document.positionAt(i + 1),
                end: document.positionAt(offset - 1),
              })
              .split(':');
            break;
          }
        }

        if (
          BracketHandlers.map((handler) => handler.name).indexOf(
            predecessor[0]
          ) === -1
        ) {
          predecessor = ['item', ...predecessor];
        }

        return BracketHandlerMap.get(predecessor[0])
          ? BracketHandlerMap.get(predecessor[0]).next(predecessor)
          : [];
      case '<':
        const setting = await getdocumentSettings(completion.textDocument.uri);
        return manuallyTriggerred || setting.autoshowLTCompletion
          ? setting.modIdItemCompletion
            ? [...SimpleBracketHandlers, ...ItemBracketHandler.next(['item'])]
            : [...SimpleBracketHandlers]
          : [];

      default:
        return [...GlobalCompletion()];
    }
  }

  static doCompletionResolve(item: CompletionItem): CompletionItem {
    if (item.data) {
      switch (item.data.triggerCharacter) {
        case '.':
          // TODO: Completion for `.`
          break;
        case ':':
          if (
            item.data.predecessor instanceof Array &&
            item.data.predecessor.length > 0
          ) {
            return BracketHandlerMap.get(item.data.predecessor[0]).detail(item);
          } else {
            return { label: '' };
          }
        case '<':
          const handler = DetailBracketHandlers.find(
            (i) => i.label === item.label
          );
          if (handler) {
            return handler;
          }
        // else here should return
        // and jumped to default
        // so `else return;` can be deleted
        default:
          return { label: '' };
      }
    }
  }
}
