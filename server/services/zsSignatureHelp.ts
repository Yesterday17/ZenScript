import {
  InitializeResult,
  SignatureHelpTriggerKind,
} from 'vscode-languageserver';
import { zGlobal } from '../api/global';
import { IDENTIFIER } from '../parser/zenscript/zsLexer';
import { findToken } from '../utils/findToken';
import { ClientInfo, ZenScriptService } from './zsService';

export class ZenScriptSignatureHelp implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return (
      !!client.capability.textDocument &&
      !!client.capability.textDocument.signatureHelp
    );
  }
  apply(service: InitializeResult): void {
    service.capabilities.signatureHelpProvider = {
      triggerCharacters: ['('],
    };
    zGlobal.conn.onSignatureHelp((params) => {
      if (!zGlobal.bus.isFinished('all-zs-parsed')) {
        return;
      }
      // 获得当前正在修改的 document
      const document = zGlobal.documents.get(params.textDocument.uri);
      // 当前 Signature 的位置
      const position = params.position;
      // 当前 Signature 的 offset
      const offset = document.offsetAt(position);
      // Tokens
      const tokens = zGlobal.zsFiles.get(document.uri).tokens;

      let token = findToken(tokens, offset - 1);
      let call = '',
        depth = 0;

      if (
        params.context.triggerKind === SignatureHelpTriggerKind.ContentChange
      ) {
        if (token.found.token.image === ')') {
          return {
            activeParameter: null,
            activeSignature: null,
            signatures: [],
          };
        } else {
          return params.context.activeSignatureHelp;
        }
      }

      token = findToken(tokens, token.found.token.startOffset - 1);
      while (token.exist && token.found.token.tokenType === IDENTIFIER) {
        call = token.found.token.image + '.' + call;
        depth++;

        const prev = findToken(tokens, token.found.token.startOffset - 1);
        if (!prev.exist || prev.found.token.image !== '.') {
          break;
        }
        token = prev;
      }
      call = call.substring(0, call.length - 1);

      if (depth === 1 && zGlobal.globalFunction.has(call)) {
        const item = zGlobal.globalFunction.get(call);
        return {
          signatures: item.map((b) => {
            return {
              label: `${call}(${b.params.join(', ')}) -> ${b.return}`,
              parameters: [],
            };
          }),
          activeParameter: 0,
          activeSignature: 0,
        };
      }

      return { activeParameter: null, activeSignature: null, signatures: [] };
    });
  }
}
