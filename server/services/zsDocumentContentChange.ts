import {
  Diagnostic,
  DiagnosticSeverity,
  InitializeResult,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { zGlobal } from '../api/global';
import { ZenParsedFile } from '../api/zenParsedFile';
import { ZenScriptActiveService } from './zsService';

export class ZenScriptDocumentContentChange extends ZenScriptActiveService {
  apply(service: InitializeResult): void {
    zGlobal.documents.onDidChangeContent(async (event) => {
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
      let pkg =
        'scripts.' +
        textDocument.uri
          .substr(zGlobal.baseFolder.length)
          .replace(/^\//g, '')
          .replace(/[\/\\]/g, '.')
          .replace(/\.zs$/, '');
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

    const ast = file.ast;
    // if (ast) {
    //   zGlobal.console.log(
    //     JSON.stringify({
    //       type: ast.type,
    //       import: ast.import,
    //       // global: Array.from(ast.global),
    //       // static: Array.from(ast.static),
    //       // function: Array.from(ast.function),
    //       body: ast.body,
    //       error: ast.errors,
    //     })
    //   );
    // }

    // parse errors
    [...file.parseErrors, ...file.interpreteErrors].forEach((error) => {
      const diagnotic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(
            error.start ?? error.token.startOffset
          ),
          end: textDocument.positionAt(error.end ?? error.token.endOffset + 1),
        },
        message: error.message,
      };
      diagnostics.push(diagnotic);
    });

    // bracket errors
    if (!file.ignoreBracketErrors) {
      // TODO
    }

    // send error diagnostics to client
    zGlobal.conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }
}
