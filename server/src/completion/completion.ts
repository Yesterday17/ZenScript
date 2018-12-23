import { CompletionItem } from "vscode-languageserver";

export class CompletionItemDetailed {
  private _item: CompletionItem;
  constructor(i: CompletionItem) {
    this._item = i;
  }
  get simple(): CompletionItem {
    return {
      label: this._item.label,
      kind: this._item.kind
    };
  }
  get detail(): CompletionItem {
    return this._item;
  }
}

export abstract class ZenScriptCompletion {
  private _base: CompletionItemDetailed;
  private _completion: Map<number, CompletionItemDetailed[]>;

  constructor(base: CompletionItem) {
    this._completion = new Map();
    this._base = new CompletionItemDetailed(base);
  }

  get base() {
    return this._base;
  }

  add(level: number, item: CompletionItem): number {
    if (!this._completion.has(level)) {
      this._completion.set(level, [new CompletionItemDetailed(item)]);
    } else {
      this._completion.get(level).push(new CompletionItemDetailed(item));
    }
    return this._completion.get(level).length;
  }

  get(level: number): CompletionItemDetailed[] {
    return this._completion.get(level);
  }
}
