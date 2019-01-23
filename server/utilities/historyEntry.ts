import { HistoryEntryItem } from '../../api/requests/HistoryEntryRequest';

/**
 * Inspired by @Snownee discussed in @TeamCovertDragon QQ Group.
 */

class EntryNode {
  public readonly element: string;
  public usage: number = 1;
  public next: EntryNode;

  constructor(elem: string) {
    this.element = elem;
    this.next = null;
  }

  at(position: number): EntryNode {
    let now: EntryNode = this;
    for (; position > 0; position--, now = now.next) {
      if (now === null) {
        break;
      }
    }
    return now;
  }
}

class HistoryEntryHandler {
  private top: EntryNode = new EntryNode('ENTRY_NODE_TOP');
  private len: number = 0;

  constructor() {
    // Set usage of top to 0
    this.top.usage = 0;
  }

  /**
   * Find a certain entry in the HistoryEntry LinkedList.
   * @param entry The entry to find.
   */
  public find(entry: string): EntryNode | null {
    let now = this.top;
    for (; now !== null; now = now.next) {
      if (now.element === entry) {
        break;
      }
    }
    return now;
  }

  /**
   * Add an entry to HistoryEntry LinkedList
   * @param entry The entry to add
   */
  public add(entry: string) {
    const find = this.find(entry);

    // When entry doesn't exist
    if (find === null) {
      const node = new EntryNode(entry);
      this.top.at(this.len).next = node;
      this.len++;
    } else {
      // When extry exists
      find.usage++;

      // TODO: Sort HistoryEntry LinkedList.
    }
  }

  get entries(): HistoryEntryItem[] {
    const result: HistoryEntryItem[] = [];
    // Skip the top element
    let now = this.top.next;

    while (now !== null) {
      // Add now to result array
      result.push({
        element: now.element,
        usage: now.usage,
      } as HistoryEntryItem);
      now = now.next;
    }

    return result;
  }
}

export const HistoryEntries = new HistoryEntryHandler();
