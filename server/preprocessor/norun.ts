import { IPreProcessor } from '../api/IPreProcessor';
import { HashNoRun } from '../completion/preprocessor/norun';
import { zGlobal } from '../api/global';

class NoRunPreProcessor implements IPreProcessor {
  completion = HashNoRun;
  handle(path: string, args: string[]) {
    zGlobal.zsFiles.get(path).norun = true;
  }
}

export const NoRunHandler = new NoRunPreProcessor();
