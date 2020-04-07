import * as path from 'path';
import {
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  TextEditor,
  window,
} from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { ServerStatusRequestType } from '../../api/requests/ServerStatusRequest';
import { Registerable } from '../api/Registerable';

class ZSStatusBar implements Registerable {
  bar: StatusBarItem;
  active: boolean;
  interval: NodeJS.Timeout;

  constructor() {
    this.bar = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    this.bar.command = '';
    this.bar.color = '#32CD32';
    this.bar.text = '$(sync~spin) ZenScript';
    this.active = false;
    this.interval = undefined;
  }

  activate() {
    this.bar.text = '$(check) ZenScript';
  }

  reset() {
    this.bar.text = '$(sync~spin) ZenScript';
  }

  check(client: LanguageClient) {
    client.sendRequest(ServerStatusRequestType).then((v) => {
      if (v) {
        this.activate();
      } else {
        this.reset();
      }
      this.show();
    });
  }

  startInterval(client: LanguageClient) {
    this.interval = setInterval(() => this.check(client), 1000);
  }

  register(client: LanguageClient, context: ExtensionContext) {
    // Register statusbar
    context.subscriptions.push(this.bar);

    // Register texteditor change event
    context.subscriptions.push(
      window.onDidChangeActiveTextEditor(async (e: TextEditor) => {
        if (e && e.document) {
          if (
            path.extname(e.document.uri.fsPath).toLowerCase() === '.zs' &&
            !this.interval
          ) {
            this.check(client);
            this.startInterval(client);
          }
        } else {
          clearInterval(this.interval);
          this.hide();
        }
      })
    );
  }

  show() {
    this.bar.show();
  }

  hide() {
    this.bar.hide();
  }
}

export const StatusBar = new ZSStatusBar();
