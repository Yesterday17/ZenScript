import * as path from 'path';
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
  TextDocument,
  TextDocuments,
  WorkspaceFolder,
} from 'vscode-languageserver';
import Uri from 'vscode-uri';
import { zGlobal } from './api/global';
import { defaultSettings } from './api/setting';
import {
  BracketHandlerMap,
  DetailBracketHandlers,
  SimpleBracketHandlers,
} from './completion/bracketHandler/bracketHandlers';
import { Keywords } from './completion/completion';
import { applyRequests } from './requests/requests';
import { findToken } from './utils/findToken';
import { reloadRCFile } from './utils/zsrcFile';
import { PreProcessorCompletions } from './completion/preprocessor/preprocessors';
import { ZenScriptSettings } from './api';
import { AllZSFiles } from './utils/path';
import { ZenParsedFile } from './api/zenParsedFile';
import { ItemBracketHandler } from './completion/bracketHandler/item';

// 创建一个服务的连接，连接使用 Node 的 IPC 作为传输
// 并且引入所有 LSP 特性, 包括 preview / proposed
let connection = createConnection(ProposedFeatures.all);

// 创建一个简单的文本文档管理器，这个管理器仅仅支持同步所有文档
let documents: TextDocuments = new TextDocuments();

// capabilities
let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  const folders = params.workspaceFolders ? [...params.workspaceFolders] : [];

  // No Folder is opened / foldername !== scripts
  // disable most of language server features
  let folder: WorkspaceFolder | undefined = undefined;
  folders.forEach(
    f =>
      (folder =
        f.name === 'scripts' ||
        path.basename(Uri.parse(f.uri).fsPath) === 'scripts'
          ? f
          : folder)
  );

  // whether a folder named `scripts` exists
  if (folder) {
    zGlobal.baseFolder = folder.uri;
    reloadRCFile(connection);

    // Load all files
    AllZSFiles(Uri.parse(zGlobal.baseFolder).fsPath).forEach(file => {
      // new parsed file
      const zsFile = new ZenParsedFile(file);
      // save to map first
      zGlobal.zsFiles.set(Uri.file(file).toString(), zsFile);
      // then preprocess(not parse to save time)
      zsFile.load().preprocess();
    });
  } else {
    zGlobal.isProject = false;
  }

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace && !!capabilities.workspace.configuration;
  hasWorkspaceFolderCapability =
    capabilities.workspace && !!capabilities.workspace.workspaceFolders;

  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [
          '#', // #*auto_preprocessor*
          '.', // recipes.*autocomplete*
          ':', // ore:*Autocomplete*
          '<', // <*autocomplete*:*autocomplete*>
        ],
      },
      hoverProvider: zGlobal.isProject,
      // TODO: Support ZenScript Formatting
      documentFormattingProvider: true,
    },
  };
});

connection.onInitialized(() => {
  connection.workspace
    .getConfiguration({ section: 'zenscript' })
    .then(setting => {
      zGlobal.setting = { ...setting };
      // Isn't a folder warn.
      if (
        zGlobal.baseFolder !== '' &&
        !zGlobal.isProject &&
        zGlobal.setting.showIsProjectWarn
      ) {
        connection.window.showWarningMessage(
          `ZenScript didn't enable all its features!
      Please check your folder name, it must be 'scripts', or a folder in your workspace must be named 'scripts'.`
        );
      }
    });

  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }

  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// cache setting for all opened documents
let documentSettings: Map<string, Thenable<ZenScriptSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // reset all the settings
    documentSettings.clear();
  } else {
    zGlobal.setting = <ZenScriptSettings>(
      (change.settings.zenscript || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ZenScriptSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(zGlobal.setting);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'zenscript',
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// 只保留打开文档的设置
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  let settings = await getDocumentSettings(textDocument.uri);
  const diagnostics: Diagnostic[] = [];

  // save lexing result
  if (!zGlobal.zsFiles.has(textDocument.uri)) {
    zGlobal.zsFiles.set(
      textDocument.uri,
      new ZenParsedFile(Uri.parse(textDocument.uri).fsPath)
    );
  }

  const file = zGlobal.zsFiles
    .get(textDocument.uri)
    .text(textDocument.getText())
    .preprocess()
    .parse();

  const ast = file.ast;
  if (ast) {
    connection.console.log(
      JSON.stringify({
        type: ast.type,
        import: ast.import,
        global: Array.from(ast.global),
        static: Array.from(ast.static),
        function: Array.from(ast.function),
        body: ast.body,
        error: ast.errors,
      })
    );
  }

  // save errors
  zGlobal.zsFiles.get(textDocument.uri).parseErrors.map(error => {
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

  // send error diagnostics to client
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// 当 Watch 的文件确实发生变动
connection.onDidChangeWatchedFiles(_change => {
  for (const change of _change.changes) {
    if (
      new URL(change.uri).hash === new URL(zGlobal.baseFolder + '/.zsrc').hash
    ) {
      reloadRCFile(connection);
      break;
    }
  }
});

// 负责处理自动补全的条目
// 发送较为简单的消息
connection.onCompletion(async completion => {
  // 获得当前正在修改的 document
  const document = documents.get(completion.textDocument.uri);
  // 当前补全的位置
  const position = completion.position;
  // 当前补全的 offset
  const offset = document.offsetAt(position);
  // 当前文档的文本
  const content = document.getText();
  // triggerred automatically or manually
  const manuallyTriggerred = completion.context.triggerCharacter === undefined;

  let triggerCharacter = completion.context.triggerCharacter;
  if (manuallyTriggerred) {
    const token = findToken(
      zGlobal.zsFiles.get(document.uri).tokens,
      offset - 1
    );
    if (token.exist && token.found.token.image.length === 1) {
      triggerCharacter = token.found.token.image;
    } else {
      return null;
    }
  }

  // TODO: 完成自动补全
  switch (triggerCharacter) {
    case '#':
      return PreProcessorCompletions;
    case '.':
      break;
    case ':':
      // 位于 <> 内的内容
      let predecessor: string[] = [];

      // 寻找 inBracket
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

      return BracketHandlerMap.get(predecessor[0])
        ? BracketHandlerMap.get(predecessor[0]).next(predecessor)
        : null;
    case '<':
      const setting = await documentSettings.get(completion.textDocument.uri);
      return manuallyTriggerred || setting.autoshowLTCompletion
        ? setting.modIdItemCompletion
          ? [...SimpleBracketHandlers, ...ItemBracketHandler.next(['item'])]
          : [...SimpleBracketHandlers]
        : [];

    default:
      return [...Keywords];
  }
});

// 负责处理自动补全条目选中时的信息
// 将完整的信息发送至 Client
// TODO: 发送正确的信息
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.data === undefined) {
      return;
    }

    switch (item.data.triggerCharacter) {
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
        return DetailBracketHandlers.find(i => {
          return i.label === item.label;
        });
      default:
        return;
    }
  }
);

// Handle mouse onHover event
connection.onHover(hoverPosition => {
  // 获得当前正在修改的 document
  const document = documents.get(hoverPosition.textDocument.uri);
  // 当前鼠标指向的位置
  const position = hoverPosition.position;

  // when document doesn't exist, return void
  if (!document) {
    return Promise.resolve(void 0);
  }

  // Get offset
  const offset = document.offsetAt(position);

  // Debug
  connection.console.log(
    JSON.stringify(zGlobal.zsFiles.get(hoverPosition.textDocument.uri).cst)
  );

  const token = findToken(
    zGlobal.zsFiles.get(hoverPosition.textDocument.uri).tokens,
    offset
  );

  if (token.exist) {
    const hover: Hover = {
      contents: {
        kind: 'plaintext',
        value: token.found.token.tokenType.tokenName,
      },
      range: {
        start: document.positionAt(token.found.token.startOffset),
        end: document.positionAt(token.found.token.endOffset + 1),
      },
    };
    return Promise.resolve(hover);
  } else {
    // Token not found, which means that hover is not needed
    return Promise.resolve(void 0);
  }
});

connection.onDocumentFormatting(params => {
  const document = documents.get(params.textDocument.uri);
  return null;
});

// apply all requests
applyRequests(connection);

// listen connection to trigger events
documents.listen(connection);

// start listening
connection.listen();
