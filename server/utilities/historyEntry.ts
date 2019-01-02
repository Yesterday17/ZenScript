import { HistoryEntryItem } from "@/requests/HistoryEntryRequest";

/**
 * Idea by @Snownee discussed in @TeamCovertDragon QQ Group.
 */

class EntryNode {
  public readonly element: string;
  public usage: number = 1;
  public prev: EntryNode;
  public next: EntryNode;

  constructor(elem: string) {
    this.element = elem;
    this.next = null;
  }
}

class HistoryEntryHandler {
  private top: EntryNode = null;
  private len: number = 0;

  public find(entry: string): EntryNode | null {
    let now: EntryNode = this.top;
    while (now !== null) {
      if (now.element === entry) {
        return now;
      }
    }
    return null;
  }

  public add(entry: string) {
    const find = this.find(entry);

    // 当历史纪录未记录时
    if (find === null) {
      const node = new EntryNode(entry);
      node.next = this.top;
      this.top = node;
      this.len++;
      return;
    }

    // 当历史纪录存在时
    find.usage++;
    find.prev.next = find.next;
    find.next.prev = find.prev;
    find.prev = null;
    find.next = this.top;
    this.top = find;
  }

  get entries(): HistoryEntryItem[] {
    const result: HistoryEntryItem[] = [];
    let now = this.top;
    while (now !== null) {
      result.push({
        element: now.element,
        usage: now.usage
      } as HistoryEntryItem);
      now = now.next;
    }
    return result;
  }
}

export const HistoryEntries = new HistoryEntryHandler();
