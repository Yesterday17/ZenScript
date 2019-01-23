import {
  window,
  StatusBarAlignment,
  StatusBarItem,
  ExtensionContext
} from 'vscode';
import { Registerable } from 'client/api/Registerable';
import { LanguageClient } from 'vscode-languageclient';

class ZSStatusBar implements Registerable {
  private bar: StatusBarItem;

  constructor() {
    this.bar = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    this.bar.command = '';
    this.bar.color = '#9999FF';
    this.bar.text = '233';
  }

  register(client: LanguageClient, context: ExtensionContext) {
    context.subscriptions.push(this.bar);
  }

  show() {
    this.bar.show();
  }

  hide() {
    this.bar.hide();
  }
}

export const StatusBar = new ZSStatusBar();
