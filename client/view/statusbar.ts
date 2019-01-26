import {
  window,
  StatusBarAlignment,
  StatusBarItem,
  ExtensionContext,
  TextEditor,
} from 'vscode';
import { Registerable } from '../api/Registerable';
import { LanguageClient } from 'vscode-languageclient';
import * as path from 'path';

class ZSStatusBar implements Registerable {
  bar: StatusBarItem;

  constructor() {
    this.bar = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    this.bar.command = '';
    this.bar.color = '#32CD32';
    this.bar.text = 'ZenScript';
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
            this.show();
            return;
          }
        }
        this.hide();
      })
    );

    // Show status bar
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
