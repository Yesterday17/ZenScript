import {
  createConnection,
  TextDocuments,
  TextDocument,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  Hover
} from "vscode-languageserver";
import { ZSLexer } from "./parser/zsLexer";
import { IToken } from "chevrotain";
import { ZenScriptParser } from "./parser/zsParser";
import * as fs from "fs";
import {
  DetailBracketHandlers,
  SimpleBracketHandlers,
  BracketHandlerMap
} from "./completion/bracketHandler/bracketHandlers";
import { Keywords, Preprocessors } from "./completion/completion";
import { URL } from "url";
import { zGlobal } from "./api/global";
import { ZenScriptSettings, defaultSettings } from "./api/setting";
import { applyRequests } from "./requests/requests";

// 创建一个服务的连接，连接使用 Node 的 IPC 作为传输
// 并且引入所有 LSP 特性, 包括 preview / proposed
let connection = createConnection(ProposedFeatures.all);

// 创建一个简单的文本文档管理器，这个管理器仅仅支持同步所有文档
let documents: TextDocuments = new TextDocuments();

// 不支持配置
let hasConfigurationCapability: boolean = false;

// Lex
let tokens: IToken[] = [];

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  const folders = params.workspaceFolders;

  // 只打开了 zs 文件
  // 开启最低限度的语言支持
  if (folders === null || folders[0].name !== "scripts") {
    zGlobal.isProject = false;
  } else {
    zGlobal.baseFolder = folders[0].uri;
  }

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace && !!capabilities.workspace.configuration;

  // 加载 .zsrc 配置文件
  reloadRCFile();

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
      hoverProvider: zGlobal.isProject,
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
});

let globalSettings: ZenScriptSettings = defaultSettings;

// 为所有打开的文档缓存配置
let documentSettings: Map<string, Thenable<ZenScriptSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // 重置全部设置
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

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  let settings = await getDocumentSettings(textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  let text = textDocument.getText();

  const lexResult = ZSLexer.tokenize(text);
  tokens = lexResult.tokens;
  // new ZenScriptParser(tokens).Program();
}

// 重新加载 .zsrc 文件
function reloadRCFile() {
  try {
    zGlobal.rcFile = JSON.parse(
      fs.readFileSync(new URL(zGlobal.baseFolder + "/.zsrc"), {
        encoding: "utf-8"
      })
    );

    // Reload Mods
    zGlobal.mods.clear();
    zGlobal.rcFile.mods.forEach(value => {
      zGlobal.mods.set(value.modid, value);
    });

    // Items
    zGlobal.items.clear();
    zGlobal.idMaps.items.clear();
    zGlobal.rcFile.items.forEach(value => {
      if (!zGlobal.items.has(value.resourceLocation.domain)) {
        zGlobal.items.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.items.get(value.resourceLocation.domain).push(value);
      }

      zGlobal.idMaps.items.set(value.id, value);
    });

    // Enchantments
    zGlobal.enchantments.clear();
    zGlobal.rcFile.enchantments.forEach(value => {
      if (!zGlobal.enchantments.has(value.resourceLocation.domain)) {
        zGlobal.enchantments.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.enchantments.get(value.resourceLocation.domain).push(value);
      }
    });

    // Entities
    zGlobal.entities.clear();
    zGlobal.idMaps.entities.clear();
    zGlobal.rcFile.entities.forEach(value => {
      if (!zGlobal.entities.has(value.resourceLocation.domain)) {
        zGlobal.entities.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.entities.get(value.resourceLocation.domain).push(value);
      }

      zGlobal.idMaps.entities.set(value.id, value);
    });

    // Fluids
    zGlobal.fluids.clear();
    zGlobal.rcFile.fluids.forEach(value => {
      if (!zGlobal.fluids.has(value.resourceLocation.domain)) {
        zGlobal.fluids.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.fluids.get(value.resourceLocation.domain).push(value);
      }
    });
  } catch (e) {
    connection.console.error(e.message);
  }
}

// 当 Watch 的文件确实发生变动
connection.onDidChangeWatchedFiles(_change => {
  for (const change of _change.changes) {
    if (
      new URL(change.uri).hash === new URL(zGlobal.baseFolder + "/.zsrc").hash
    ) {
      reloadRCFile();
      break;
    }
  }
});

// 负责处理自动补全的条目
// 发送较为简单的消息
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

    // 触发自动补全的字符
    let triggerCharacter = textDocumentPositionParams.context.triggerCharacter;
    // 是否是这样的形式:
    // <xxx:yyy:[触发补全]>
    let justClose: boolean = false;

    // 使用快捷键触发
    if (triggerCharacter === undefined) {
      // 寻找可能的补全类型
      for (let i = offset - 1; i >= 0; i--) {
        // 当 : 与 < 不再同一行时直接退出
        if (content[i] === "\n") {
          break;
        }

        if (content[i].match(/<|:|\.|#/g)) {
          triggerCharacter = content[i];

          if (i === offset - 1) {
            justClose = true;
          }
          break;
        }
      }
    }

    // TODO: 完成自动补全
    switch (triggerCharacter) {
      case "#":
        return Preprocessors;
      case ".":
        break;
      case ":":
        // 位于 <> 内的内容
        let predecessor: string[] = [];

        // 寻找 inBracket
        for (let i = offset - 1; i >= 0; i--) {
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
        // HistoryEntries.add(predecessor[0]);
        return BracketHandlerMap.get(predecessor[0])
          ? textDocumentPositionParams.context.triggerCharacter || justClose
            ? BracketHandlerMap.get(predecessor[0]).next(predecessor)
            : BracketHandlerMap.get(predecessor[0]).next(
                predecessor.splice(predecessor.length - 2, 1)
              )
          : null;
      case "<":
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
      case ":":
        if (
          item.data.predecessor instanceof Array &&
          item.data.predecessor.length > 0
        ) {
          return BracketHandlerMap.get(item.data.predecessor[0]).detail(item);
        } else {
          return;
        }
      case "<":
        return DetailBracketHandlers.find(i => {
          return i.label === item.label;
        });
      default:
        return;
    }
  }
);

// 负责处理鼠标 Hover
// 此处不用处理 isProject
// 若未打开目录 则不会发送 Request
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

// 配置 Requests
applyRequests(connection);

// 使得 documents 监听 connection 以触发相应事件
documents.listen(connection);

// 开始 listen
connection.listen();
