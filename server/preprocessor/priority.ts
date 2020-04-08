import { zGlobal } from '../api/global';
import { HashPriority } from '../completion/preprocessor/priotiry';
import { IPreProcessor } from './IPreProcessor';

class PriorityPreProcessor implements IPreProcessor {
  completion = HashPriority;
  handle(path: string, args: string[]) {
    if (args.length < 2 || !args[1].match(/-?(?:0|[1-9][0-9]*)/)) {
      return;
    }

    zGlobal.zsFiles.get(path).priority = parseInt(args[1]);
  }
}

export interface IPriority {
  priority: number;
  loader: string;
}

export const PriorityHandler = new PriorityPreProcessor();
