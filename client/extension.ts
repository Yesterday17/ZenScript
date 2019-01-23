import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient';
import {
  CommandHistoryEntryGet,
  CommandHistoryEntryAdd
} from './command/historyEntry';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // Server 是以 Node 实现的
  let serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'server.js')
  );

  // Server 的 Debug 配置
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // 当处于 Debug 状态时使用 Debug, 通常情况使用 run
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  // 控制 Language Client 的选项
  const clientOptions: LanguageClientOptions = {
    // 为 Language Server 注册文件类型为 ZenScript
    documentSelector: [{ scheme: 'file', language: 'zenscript' }],
    synchronize: {
      // 当工作空间中的'.clientrc'文件改变时通知服务
      fileEvents: workspace.createFileSystemWatcher('**/.zsrc')
    }
  };

  // 创建并启动 Client
  client = new LanguageClient(
    'zenscript',
    'Zenscript',
    serverOptions,
    clientOptions
  );

  // 注册命令
  CommandHistoryEntryGet.register(client, context);
  CommandHistoryEntryAdd.register(client, context);

  //TODO: 注册 zenscriptExplorer

  // 启动 Client, 同时也会启动 Server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
