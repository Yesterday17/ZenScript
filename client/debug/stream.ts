import { commands, workspace } from 'vscode';
import WebSocket from 'ws';

export function streamChannel() {
  const config = workspace.getConfiguration('zenscript.trace.server');
  if (config.channel === 'output') {
    return;
  }

  let socket: WebSocket | null = null;
  commands.registerCommand('zenscript.command.startStreaming', () => {
    // Establish websocket connection
    socket = new WebSocket(`ws://localhost:${config.get('streamPort')}`);
  });

  let log = '';
  return {
    name: 'websocket',
    // Only append the logs but send them later
    append(value: string) {
      log += value;
    },
    appendLine(value: string) {
      log += value;
      // Don't send logs until WebSocket initialization
      if (socket && socket.readyState === WebSocket.OPEN) {
        // FIXME: https://github.com/microsoft/language-server-protocol-inspector/issues/56
        log = ' '.repeat(21) + log.replace(/^\[LSP[^\]]+\]\s*/, '');
        socket.send(log);
      }
      log = '';
    },
    clear() {},
    show() {},
    hide() {},
    dispose() {},
  };
}
