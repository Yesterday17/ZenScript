import {
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  window,
} from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { Registerable } from '../api/Registerable';

class ZSStatusBar implements Registerable {
  bar: StatusBarItem;

  constructor() {
    this.bar = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    this.bar.command = '';
    this.bar.color = '#32CD32';
    this.bar.text = '$(sync~spin) ZenScript';
  }

  activate() {
    this.bar.text = '$(check) ZenScript';
  }

  reset() {
    this.bar.text = '$(sync~spin) ZenScript';
  }

  check(v: boolean) {
    if (v) {
      this.activate();
    } else {
      this.reset();
    }
    this.show();
  }

  register(client: LanguageClient, context: ExtensionContext) {
    // Register statusbar
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
