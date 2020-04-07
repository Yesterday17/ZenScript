import { Hover, HoverParams, InitializeResult } from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { findToken } from '../utils/findToken';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptHover implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return (
      !!client.capability.textDocument && !!client.capability.textDocument.hover
    );
  }

  apply(service: InitializeResult): void {
    service.capabilities.hoverProvider = true;
    zGlobal.conn.onHover(ZenScriptHover.doHover);
  }

  static async doHover(hoverPosition: HoverParams): Promise<Hover> {
    if (!zGlobal.bus.isFinished('all-zs-parsed')) {
      return;
    }

    // 获得当前正在修改的 document
    const document = zGlobal.documents.get(hoverPosition.textDocument.uri);

    // when document doesn't exist, return void
    if (!document) {
      return Promise.resolve(undefined);
    }

    // Get offset of current mouse
    const offset = document.offsetAt(hoverPosition.position);

    const parsedFile = zGlobal.zsFiles.get(document.uri);

    // FIXME: find out why parsedFile is not parsed
    if (!parsedFile.isInterpreted) {
      parsedFile.interprete();
    }

    let token = findToken(parsedFile.tokens, offset);
    if (!token.exist) {
      token = findToken(parsedFile.comments, offset);
    }

    if (token.exist) {
      const hover: Hover = {
        contents: {
          kind: 'plaintext',
          value: token.found.token.tokenType.name,
        },
        range: {
          start: document.positionAt(token.found.token.startOffset),
          end: document.positionAt(token.found.token.endOffset + 1),
        },
      };
      return hover;
    } else {
      // Token not found, which means that hover is not needed
      return null;
    }
  }
}
