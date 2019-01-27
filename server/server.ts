import { IToken } from 'chevrotain';
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
import { ZSLexer } from './parser/zsLexer';
import { ZSParser } from './parser/zsParser';
import {
  getPreProcessorList,
  PreProcessors,
  PreProcessorHandlersMap,
} from './preprocessor/zsPreProcessor';
import { applyRequests } from './requests/requests';
import { findToken } from './utils/findToken';
import { reloadRCFile } from './utils/zsrcFile';
import { PreProcessorCompletions } from './completion/preprocessor/preprocessors';
import { ZenScriptSettings } from './api';

// 创建一个服务的连接，连接使用 Node 的 IPC 作为传输
// 并且引入所有 LSP 特性, 包括 preview / proposed
let connection = createConnection(ProposedFeatures.all);

// 创建一个简单的文本文档管理器，这个管理器仅仅支持同步所有文档
let documents: TextDocuments = new TextDocuments();

// 不支持配置
let hasConfigurationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  const folders = params.workspaceFolders ? [...params.workspaceFolders] : [];

  // No Folder is opened / foldername !== scripts
  // disable most of language server features
  // TODO: Make it available for workspace
  let folder: WorkspaceFolder | undefined = undefined;
  folders.forEach(
    f =>
      (folder =
        f.name === 'scripts' ||
        path.basename(Uri.parse(f.uri).fsPath) === 'scripts'
          ? f
          : folder)
  );

  // whether a folder named `scripts` exist
  if (folder) {
    zGlobal.baseFolder = folder.uri;
    reloadRCFile(connection);
  } else {
    zGlobal.isProject = false;
  }

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace && !!capabilities.workspace.configuration;

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
      documentFormattingProvider: false,
    },
  };
});

connection.onInitialized(() => {
  // Isn't a folder warn.
  if (!zGlobal.isProject && globalSettings.showIsProjectWarn) {
    connection.window.showWarningMessage(
      `ZenScript didn't enable all its features!
      Please check your folder name, it must be 'scripts', or a folder in your workspace must be named 'scripts'.`
    );
  }

  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
});

let globalSettings: ZenScriptSettings = defaultSettings;

// cache setting for all opened documents
let documentSettings: Map<string, Thenable<ZenScriptSettings>> = new Map();

// Tokens
const documentTokens: Map<string, IToken[]> = new Map();
const documentCSTs: Map<string, any> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // reset all the settings
    documentSettings.clear();
  } else {
    globalSettings = <ZenScriptSettings>(
      (change.settings.zenscript || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ZenScriptSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
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
  documentTokens.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  let settings = await getDocumentSettings(textDocument.uri);

  const preProcessedText = getPreProcessorList(
    textDocument.getText(),
    PreProcessors
  );

  // run preprocessors
  preProcessedText.slice(1).forEach(preprocessor => {
    const split = preprocessor.split(' ');
    if (PreProcessorHandlersMap.has(split[0])) {
      PreProcessorHandlersMap.get(split[0]).handle(textDocument.uri, split);
    }
  });

  let text = preProcessedText[0];

  const lexResult = ZSLexer.tokenize(text);
  const diagnostics: Diagnostic[] = [];

  // save lexing result
  documentTokens.set(textDocument.uri, lexResult.tokens);
  // save parsing result
  documentCSTs.set(textDocument.uri, ZSParser.parse(lexResult.tokens));

  // save errors
  ZSParser.errors.map(error => {
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
connection.onCompletion(
  (completion): CompletionItem[] => {
    // 获得当前正在修改的 document
    const document = documents.get(completion.textDocument.uri);
    // 当前补全的位置
    const position = completion.position;
    // 当前补全的 offset
    const offset = document.offsetAt(position);
    // 当前文档的文本
    const content = document.getText();

    let triggerCharacter = completion.context.triggerCharacter;
    if (!triggerCharacter) {
      const token = findToken(documentTokens.get(document.uri), offset - 1);
      if (token.exist && token.found.token.image.length === 1) {
        triggerCharacter = token.found.token.image;
      } else {
        return null;
      }
    }

    // Debug
    //
    // connection.sendNotification(
    //   'zenscript/logMessage',
    //   `isProject: ${zGlobal.isProject}`
    // );

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
        return [...SimpleBracketHandlers];
      default:
        return [...Keywords];
    }
  }
);

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
    JSON.stringify(documentCSTs.get(hoverPosition.textDocument.uri))
  );

  const token = findToken(
    documentTokens.get(hoverPosition.textDocument.uri),
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

// apply all requests
applyRequests(connection);

// listen connection to trigger events
documents.listen(connection);

// start listening
connection.listen();
