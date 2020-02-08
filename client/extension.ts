import * as path from 'path';
import { ExtensionContext, workspace } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient';
import {
  CommandHistoryEntryAdd,
  CommandHistoryEntryGet,
} from './command/historyEntry';
import { CommandOpenFile } from './command/openFile';
import { applyRequests } from './request/requests';
import { PriorityTreeDataView } from './view/priority';
import { StatusBar } from './view/statusbar';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'server.js')
  );

  // Debug setting for languageServer
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // 当处于 Debug 状态时使用 Debug, 通常情况使用 run
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // options of language client
  const clientOptions: LanguageClientOptions = {
    // 为 Language Server 注册文件类型为 ZenScript
    documentSelector: [{ scheme: 'file', language: 'zenscript' }],
    synchronize: {
      configurationSection: 'zenscript',
      // 当工作空间中的'.clientrc'文件改变时通知服务
      fileEvents: workspace.createFileSystemWatcher('**/.zsrc'),
    },
  };

  // Create language client
  client = new LanguageClient(
    'zenscript',
    'ZenScript',
    serverOptions,
    clientOptions
  );

  // Register commands
  CommandHistoryEntryGet.register(client, context);
  CommandHistoryEntryAdd.register(client, context);
  CommandOpenFile.register(client, context);

  // Register status bar
  StatusBar.register(client, context);

  // Register when language server is reqdy
  client.onReady().then(() => {
    // Register requests
    applyRequests(client);
    // Priority TreeDataView
    PriorityTreeDataView.register(client, context);
  });

  // Start client & server
  client.start();
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return;
  }
  return client.stop();
}
