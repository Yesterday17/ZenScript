import { IPreProcessor } from '../api/IPreProcessor';
import { PriorityPreProcessorCompletion } from '../completion/preprocessor/priotiry';
import { zGlobal } from '../api/global';

class PriorityPreProcessor implements IPreProcessor {
  completion = PriorityPreProcessorCompletion;
  handle(path: string, args: string[]) {
    if (args.length < 2 || !args[1].match(/^\d+$/)) {
      return;
    }

    zGlobal.zsFiles.get(path).priority = parseInt(args[1]);
  }
}

export interface IPriority {
  priority: number;
}

export const PriorityHandler = new PriorityPreProcessor();
