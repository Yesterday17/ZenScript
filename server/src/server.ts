import {
  createConnection,
  TextDocuments,
  TextDocument,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  TextDocumentPositionParams,
  Hover
} from "vscode-languageserver";
import { ZSLexer } from "./parser/zsLexer";
import { IToken } from "chevrotain";
import { ZenScriptParser } from "./parser/zsParser";
import {
  DetailBracketHandlers,
  SimpleBracketHandlers,
  BracketHandlerMap
} from "./completion/bracketHandler/bracketHandlers";
import { Keywords } from "./completion/completion";

// 创建一个服务的连接，连接使用 Node 的 IPC 作为传输
// 并且引入所有 LSP 特性, 包括 preview / proposed
let connection = createConnection(ProposedFeatures.all);

// 创建一个简单的文本文档管理器，这个管理器仅仅支持同步所有文档
let documents: TextDocuments = new TextDocuments();

// 不支持配置
let hasConfigurationCapability: boolean = false;
// 不支持工作区目录
let hasWorkspaceFolderCapability: boolean = false;
//
let hasDiagnosticRelatedInformationCapability: boolean = false;

// Lex
let tokens: IToken[] = [];

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  const folders = params.workspaceFolders;

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace && !!capabilities.workspace.configuration;
  hasWorkspaceFolderCapability =
    capabilities.workspace && !!capabilities.workspace.workspaceFolders;
  hasDiagnosticRelatedInformationCapability =
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation;

  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      // 告知客户端服务端支持代码补全
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [
          "#", // #*auto_preprocessor*
          ".", // recipes.*autocomplete*
          ":", // ore:*Autocomplete*
          "<" // <*autocomplete*:*autocomplete*>
        ]
      },
      hoverProvider: true,
      // TODO: Support ZenScript Formatting
      documentFormattingProvider: false
    }
  };
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// The example settings
interface ZenScriptSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ZenScriptSettings = { maxNumberOfProblems: 100 };
let globalSettings: ZenScriptSettings = defaultSettings;

// 为所有打开的文档缓存配置
let documentSettings: Map<string, Thenable<ZenScriptSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
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
      section: "zenscript"
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

function parseInput(text: string) {
  const lexResult = ZSLexer.tokenize(text);
  // const parser = new ZenScriptParser(lexResult.tokens);

  // const cst = parser.Program();

  // if (parser.errors.length > 0) {
  //   connection.console.error(JSON.stringify(parser.errors));
  // } else {
  //   connection.console.log(JSON.stringify(cst));
  // }

  return {
    lexResult
    //cst
  };
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  let settings = await getDocumentSettings(textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  let text = textDocument.getText();

  const result = parseInput(text);
  tokens = result.lexResult.tokens;
}

connection.onDidChangeWatchedFiles(_change => {
  // 当 Watch 的文件确实发生变动
  connection.console.log("We received an file change event");
  connection.console.log(`${_change.changes[0].uri}`);
});

// 负责处理自动补全的条目, 发送较为简单的消息
connection.onCompletion(
  (textDocumentPositionParams): CompletionItem[] => {
    // 获得当前正在修改的 document
    const document = documents.get(textDocumentPositionParams.textDocument.uri);
    // 当前补全的位置
    const position = textDocumentPositionParams.position;
    // 当前补全的 offset
    const offset = document.offsetAt(position);
    // 当前文档的文本
    const content = document.getText();

    // TODO: 完成自动补全
    switch (textDocumentPositionParams.context.triggerCharacter) {
      case "#":
        break;
      case ".":
        break;
      case ":":
        // 位于 <> 内的内容
        let predecessor: string[] = [];

        // 寻找 inBracket
        for (let i = offset; i > 0; i--) {
          // 当 : 与 < 不再同一行时直接返回 null
          if (content[i] === "\n") {
            return;
          }

          if (content[i] === "<") {
            predecessor = document
              .getText({
                start: document.positionAt(i + 1),
                end: document.positionAt(offset - 1)
              })
              .split(":");
            break;
          }
        }
        return BracketHandlerMap.get(predecessor[0])
          ? BracketHandlerMap.get(predecessor[0]).next(predecessor)
          : null;
      case "<":
        return [...SimpleBracketHandlers];
      default:
        return [...Keywords];
    }
  }
);

// 负责处理自动补全条目选中时的信息, 将完整的信息发送至 Client
// TODO: 发送正确的信息
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    switch (item.data.triggerCharacter) {
      case "<":
        return DetailBracketHandlers.find(i => {
          return i.label === item.label;
        });
      default:
        break;
    }
  }
);

// 负责处理鼠标 Hover 时的处理模式
connection.onHover(textDocumentPositionParams => {
  // 获得当前正在修改的 document
  const document = documents.get(textDocumentPositionParams.textDocument.uri);
  // 当前鼠标指向的位置
  const position = textDocumentPositionParams.position;

  // 当 document 不存在时, 返回空
  if (!document) {
    return Promise.resolve(void 0);
  }

  // 获得当前位置的 offset
  const offset = document.offsetAt(position);

  // 对所有 token 进行遍历, 确定悬浮位置所在 token
  for (const token of tokens) {
    if (token.startOffset <= offset && token.endOffset >= offset) {
      // 返回该 token 的 tokenName
      return Promise.resolve({
        contents: {
          kind: "plaintext",
          value: token.tokenType.tokenName
        },
        range: {
          start: document.positionAt(token.startOffset),
          end: document.positionAt(token.endOffset + 1)
        }
      } as Hover);
    }
  }

  // 当前位置未找到有效 token
  return Promise.resolve(void 0);
});

// 使得 documents 监听 connection
// 以触发相应事件
documents.listen(connection);

// 开始 listen
connection.listen();
