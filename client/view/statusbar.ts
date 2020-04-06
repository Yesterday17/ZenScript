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

  constructor() {
    this.bar = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    this.bar.command = '';
    this.bar.color = '#32CD32';
    this.bar.text = 'ZenScript (Loading...)';
  }

  register(client: LanguageClient, context: ExtensionContext) {
    // Register statusbar
    context.subscriptions.push(this.bar);

    // Register texteditor change event
    context.subscriptions.push(
      window.onDidChangeActiveTextEditor((e: TextEditor) => {
        if (e && e.document) {
          const isZSFile =
            path.extname(e.document.uri.fsPath).toLowerCase() === '.zs';
          if (isZSFile) {
            client.sendRequest(ServerStatusRequestType).then((items) => {
              this.bar.text = 'ZenScript';
              this.show();
            });
            return;
          }
        }
      })
    );

    this.show();
  }

  show() {
    this.bar.show();
  }

  hide() {
    this.bar.hide();
  }
}

export const StatusBar = new ZSStatusBar();
