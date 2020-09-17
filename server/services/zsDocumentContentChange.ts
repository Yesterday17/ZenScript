import {
  Diagnostic,
  DiagnosticSeverity,
  InitializeResult,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { ERROR_BRACKET_HANDLER } from '../api/constants';
import { zGlobal } from '../api/global';
import { ZenParsedFile } from '../api/zenParsedFile';
import { ASTBracketHandlerError } from '../parser';
import { getdocumentSettings } from '../utils/setting';
import { ZenScriptActiveService } from './zsService';

export class ZenScriptDocumentContentChange extends ZenScriptActiveService {
  apply(service: InitializeResult): void {
    zGlobal.documents?.onDidChangeContent(async (event) => {
      ZenScriptDocumentContentChange.validateTextDocument(event.document);
    });
  }

  static async validateTextDocument(textDocument: TextDocument): Promise<void> {
    // Wait for .zsrc file
    if (zGlobal.isProject) {
      await zGlobal.bus.wait('rc-loaded');
    }

    // Wait for all rc files to be parsed
    await zGlobal.bus.wait('all-zs-parsed');
    const diagnostics: Diagnostic[] = [];

    // save lexing result
    if (!zGlobal.zsFiles.has(textDocument.uri)) {
      let pkg;
      if (zGlobal.isProject) {
        pkg =
          'scripts.' +
          textDocument.uri
            .substr(zGlobal.baseFolderUri.toString().length)
            .replace(/^\//g, '')
            .replace(/[\/\\]/g, '.')
            .replace(/\.zs$/, '');
      } else {
        pkg = '';
      }
      zGlobal.zsFiles.set(
        textDocument.uri,
        new ZenParsedFile(URI.parse(textDocument.uri), pkg, zGlobal.conn)
      );
    }

    const file = zGlobal.zsFiles
      .get(textDocument.uri)
      .text(textDocument.getText())
      .parse()
      .interprete();

    // parse errors
    file.parseErrors.forEach((error) => {
      const diagnotic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(error.token.startOffset),
          end: textDocument.positionAt(error.token.endOffset + 1),
        },
        message: error.message,
      };
      diagnostics.push(diagnotic);
    });

    if (file.ast) {
      const setting = await getdocumentSettings(textDocument.uri);
      file.interpreteErrors.forEach((error) => {
        if (error.info === ERROR_BRACKET_HANDLER) {
          if (file.ignoreBracketErrors) {
            return;
          }
          const e = error as ASTBracketHandlerError;
          if (!e.isItem && !setting.modIdItemCompletion) {
            return;
          }
        }

        // not ignored
        const diagnotic: Diagnostic = {
          severity: DiagnosticSeverity.Error,
          range: {
            start: textDocument.positionAt(error.start),
            end: textDocument.positionAt(error.end),
          },
          message: error.message,
        };
        diagnostics.push(diagnotic);
      });
    }

    // send error diagnostics to client
    zGlobal.conn?.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
