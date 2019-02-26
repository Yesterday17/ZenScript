import { zGlobal } from '../api/global';
import { IPreProcessor } from '../api/IPreProcessor';
import { LoaderPreProcessorCompletion } from '../completion/preprocessor/loader';

class PriorityPreProcessor implements IPreProcessor {
  completion = LoaderPreProcessorCompletion;
  handle(path: string, args: string[]) {
    if (args.length < 2) {
      return;
    }

    zGlobal.zsFiles.get(path).loader = args[1];
  }
}

export interface IPriority {
  priority: number;
}

export const PriorityHandler = new PriorityPreProcessor();
