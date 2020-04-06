import { URL } from 'url';
import {
  CompletionItem,
  createConnection,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  Hover,
  InitializeParams,
  ProposedFeatures,
  SignatureHelpTriggerKind,
  TextDocuments,
  TextDocumentSyncKind,
  WorkspaceFolder,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { ZenScriptSettings } from './api';
import { zGlobal } from './api/global';
import { defaultSettings } from './api/setting';
import { ZenParsedFile } from './api/zenParsedFile';
import {
  BracketHandlerMap,
  BracketHandlers,
  DetailBracketHandlers,
  SimpleBracketHandlers,
} from './completion/bracketHandler/bracketHandlers';
import { ItemBracketHandler } from './completion/bracketHandler/item';
import { GlobalCompletion } from './completion/global';
import { ImportCompletion } from './completion/import';
import { PreProcessorCompletions } from './completion/preprocessor/preprocessors';
import { DOT, IDENTIFIER, IMPORT } from './parser/zsLexer';
import { applyRequests } from './requests/requests';
import { findToken } from './utils/findToken';
import * as fs from './utils/fs';
import * as path from './utils/path';
import { AllZSFiles } from './utils/path';
import { reloadRCFile } from './utils/zsrcFile';

// 创建一个服务的连接，连接使用 Node 的 IPC 作为传输
// 并且引入所有 LSP 特性, 包括 preview / proposed
let connection = createConnection(ProposedFeatures.all);

// 创建一个简单的文本文档管理器，这个管理器仅仅支持同步所有文档
let documents = new TextDocuments(TextDocument);

// capabilities
let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

// All the folders
let folders: WorkspaceFolder[];

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;
  folders = params.workspaceFolders ?? [];

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace && !!capabilities.workspace.configuration;
  hasWorkspaceFolderCapability =
    capabilities.workspace && !!capabilities.workspace.workspaceFolders;

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        // Completion
        resolveProvider: true,
        triggerCharacters: [
          '#', // #preprocessor
          '.', // recipes.autocomplete
          ':', // ore:autocomplete
          '<', // <autocomplete>
        ],
      },
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
      hoverProvider: true,
      // TODO: Support ZenScript Formatting
      documentFormattingProvider: false,
    },
  };
});

connection.onInitialized(async () => {
  const setting = await connection.workspace.getConfiguration({
    scopeUri: 'resource',
    section: 'zenscript',
  });

  // Override the global setting.
  zGlobal.setting = { ...setting };

  // No Folder is opened / foldername !== scripts
  // disable most of language server features
  let folder: WorkspaceFolder;
  for (const f of folders) {
    const furi = URI.parse(f.uri),
      fbase = path.basename(furi);
    if (
      f.name === 'scripts' ||
      fbase === 'scripts' ||
      (await fs.existInDirectory(furi, '.zsrc', connection)) // Remote url fix
    ) {
      folder = f;
    } else if (
      zGlobal.setting.supportMinecraftFolderMode &&
      (await fs.exists(path.join(furi, 'scripts'), connection))
    ) {
      // Rejudge minecraft folder mode
      folder = {
        ...f,
        uri: path.join(furi, 'scripts').toString(),
      };
    }
  }

  // whether the target folder exists
  if (folder) {
    zGlobal.baseFolder = folder.uri;
    await reloadRCFile(connection);

    // Load all files
    zGlobal.bus.revoke('all-zs-parsed');
    const files = await AllZSFiles(
      URI.parse(zGlobal.baseFolder),
      connection,
      'scripts'
    );
    for (const { uri, pkg } of files) {
      // new parsed file
      const zsFile = new ZenParsedFile(uri, pkg, connection);
      // save to map first
      zGlobal.zsFiles.set(uri.toString(), zsFile);
      // then lex(not parse to save time)
      await zsFile.load();
      zsFile.parse();
    }
  } else {
    zGlobal.isProject = false;
  }
  zGlobal.bus.finish('all-zs-parsed');

  // Isn't a folder warn.
  if (
    zGlobal.baseFolder === '' &&
    !zGlobal.isProject &&
    zGlobal.setting.showIsProjectWarn
  ) {
    // TODO: Localize the following string
    connection.window
      .showWarningMessage(`ZenScript didn't enable all its features!
      Please check your folder name, it must be 'scripts', or a folder in your workspace must be named 'scripts'.`);
  }

  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }

  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

connection.onSignatureHelp((params) => {
  // 获得当前正在修改的 document
  const document = documents.get(params.textDocument.uri);
  // 当前 Signature 的位置
  const position = params.position;
  // 当前 Signature 的 offset
  const offset = document.offsetAt(position);
  // Tokens
  const tokens = zGlobal.zsFiles.get(document.uri).tokens;

  let token = findToken(tokens, offset - 1);
  let call = '',
    depth = 0;

  if (params.context.triggerKind === SignatureHelpTriggerKind.ContentChange) {
    if (token.found.token.image === ')') {
      return { activeParameter: null, activeSignature: null, signatures: [] };
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

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // reset all the settings
    zGlobal.documentSettings.clear();
  } else {
    zGlobal.setting = <ZenScriptSettings>(
      (change.settings.zenscript || defaultSettings)
    );
  }
  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getdocumentSettings(resource: string): Thenable<ZenScriptSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(zGlobal.setting);
  }
  if (!zGlobal.documentSettings.has(resource)) {
    zGlobal.documentSettings.set(
      resource,
      connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'zenscript',
      })
    );
  }
  return zGlobal.documentSettings.get(resource);
}

// Delete configuration of closed documents.
documents.onDidClose((event) => {
  zGlobal.documentSettings.delete(event.document.uri);
});

documents.onDidChangeContent(async (event) => {
  validateTextDocument(event.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // Wait for .zsrc file
  await zGlobal.bus.wait('rc-loaded');
  await zGlobal.bus.wait('all-zs-parsed');
  let settings = await getdocumentSettings(textDocument.uri);
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
      new ZenParsedFile(URI.parse(textDocument.uri), pkg, connection)
    );
  }

  const file = zGlobal.zsFiles
    .get(textDocument.uri)
    .text(textDocument.getText())
    .parse()
    .interprete();

  const ast = file.ast;
  if (ast) {
    connection.console.log(
      JSON.stringify({
        type: ast.type,
        import: ast.import,
        // global: Array.from(ast.global),
        // static: Array.from(ast.static),
        // function: Array.from(ast.function),
        body: ast.body,
        error: ast.errors,
      })
    );
  }

  // parse errors
  [...file.parseErrors, ...file.interpreteErrors].forEach((error) => {
    const diagnotic: Diagnostic = {
      severity: DiagnosticSeverity.Error,
      range: {
        start: textDocument.positionAt(error.start ?? error.token.startOffset),
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
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// 当 Watch 的文件确实发生变动
connection.onDidChangeWatchedFiles(async (_change) => {
  for (const change of _change.changes) {
    if (
      new URL(change.uri).hash === new URL(zGlobal.baseFolder + '/.zsrc').hash
    ) {
      await reloadRCFile(connection);
      break;
    }
  }
});

// 负责处理自动补全的条目
// 发送较为简单的消息
connection.onCompletion(async (completion) => {
  await zGlobal.bus.wait('all-zs-parsed');

  // 获得当前正在修改的 document
  const document = documents.get(completion.textDocument.uri);
  // 当前补全的位置
  const position = completion.position;
  // 当前补全的 offset
  const offset = document.offsetAt(position);
  // 当前文档的文本
  const content = document.getText();
  // Tokens
  const tokens = zGlobal.zsFiles.get(document.uri).tokens;
  // triggerred automatically or manually
  const manuallyTriggerred = completion.context.triggerCharacter === undefined;

  let triggerCharacter = completion.context.triggerCharacter;
  if (manuallyTriggerred) {
    let token = findToken(tokens, offset - 1);
    if (
      token.exist ||
      (token.found.token && token.found.token.image === 'import')
    ) {
      triggerCharacter = token.found.token.image;
    } else {
      token = findToken(zGlobal.zsFiles.get(document.uri).comments, offset - 1);
      if (token.exist && token.found.token.image === '#') {
        triggerCharacter = token.found.token.image;
      } else {
        triggerCharacter = '';
      }
    }
  }

  // TODO: Finish AutoCompletion of `.`
  switch (triggerCharacter) {
    case '#':
      return PreProcessorCompletions;
    case 'import':
      return ImportCompletion([]);
    case '.':
      // Find 'a.b.' when typing the last dot
      const now = findToken(tokens, offset - 1);
      if (!now.exist) {
        return [];
      }
      let pos,
        prev = [];
      for (pos = now.found.position; tokens[pos].tokenType === DOT; pos -= 2) {
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
      const setting = await zGlobal.documentSettings.get(
        completion.textDocument.uri
      );
      return manuallyTriggerred || setting.autoshowLTCompletion
        ? setting.modIdItemCompletion
          ? [...SimpleBracketHandlers, ...ItemBracketHandler.next(['item'])]
          : [...SimpleBracketHandlers]
        : [];

    default:
      return [...GlobalCompletion()];
  }
});

// 负责处理自动补全条目选中时的信息
// 将完整的信息发送至 Client
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
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
            return;
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
          return;
      }
    }
  }
);

// Handle mouse onHover event
connection.onHover((hoverPosition) => {
  // 获得当前正在修改的 document
  const document = documents.get(hoverPosition.textDocument.uri);

  // when document doesn't exist, return void
  if (!document) {
    return Promise.resolve(undefined);
  }

  // Get offset of current mouse
  const offset = document.offsetAt(hoverPosition.position);

  const parsedFile = zGlobal.zsFiles.get(hoverPosition.textDocument.uri);

  // FIXME: find out why parsedFile is not parsed
  if (!parsedFile.isParsed) {
    parsedFile.interprete();
  }

  // Debug
  connection.console.log(JSON.stringify(parsedFile.cst));
  connection.console.log(JSON.stringify(parsedFile.ast));

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
    return Promise.resolve(hover);
  } else {
    // Token not found, which means that hover is not needed
    return Promise.resolve(undefined);
  }
});

connection.onDocumentFormatting((params) => {
  const document = documents.get(params.textDocument.uri);
  return null;
});

// apply all requests
applyRequests(connection);

// listen connection to trigger events
documents.listen(connection);

// start listening
connection.listen();
