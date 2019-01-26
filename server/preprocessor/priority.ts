import { IPreProcessor } from '../api/IPreProcessor';
import { PriorityPreProcessorCompletion } from '../completion/preprocessor/priotiry';
import { zGlobal } from '../api/global';
import { ZSBaseName } from '../utils/path';

class PriorityPreProcessor implements IPreProcessor {
  completion = PriorityPreProcessorCompletion;
  handle(path: string, args: string[]) {
    if (args.length < 2 || !args[1].match(/^\d+$/)) {
      return;
    }

    zGlobal.priority.set(path, {
      name: ZSBaseName(path),
      path: path,
      priority: parseInt(args[1]),
    });
  }
}

export const PriorityHandler = new PriorityPreProcessor();
