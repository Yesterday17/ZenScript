import {
  TreeDataProvider,
  TreeItem,
  Command,
  window,
  ExtensionContext,
} from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import {
  PriorityTreeGetRequestType,
  PriorityTreeItem,
} from '../../api/requests/PriorityTreeRequest';
import { CommandOpenFile } from '../command/openFile';
import { Registerable } from '../api/Registerable';

class PriorityProvider implements TreeDataProvider<PriorityItem>, Registerable {
  private client: LanguageClient;
  private context: ExtensionContext;

  register(client: LanguageClient, context: ExtensionContext) {
    this.client = client;
    this.context = context;
    window.registerTreeDataProvider('priorityTree', this);
  }

  getTreeItem(element: PriorityItem): TreeItem {
    return element;
  }

  getChildren(element?: PriorityItem): Thenable<PriorityItem[]> {
    if (element) {
      // doesn't need tree view, so any node has no chlidren
      return Promise.resolve([]);
    } else {
      return this.client.sendRequest(PriorityTreeGetRequestType).then(items => {
        return items.map(item => new PriorityItem(item));
      });
    }
  }
}

export const PriorityTreeDataView = new PriorityProvider();

export class PriorityItem implements TreeItem {
  private item: PriorityTreeItem;

  constructor(item: PriorityTreeItem) {
    this.item = item;
  }

  get label(): string {
    return this.item.name;
  }

  get description(): string {
    return `Priority: ${this.item.priority}`;
  }

  get command(): Command {
    return {
      command: CommandOpenFile.command,
      title: '',
      arguments: [this.item.path],
    };
  }
}
