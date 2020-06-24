import { zGlobal } from '../api/global';
import { HashNoRun } from '../completion/preprocessor/norun';
import { IPreProcessor } from './IPreProcessor';

class NoRunPreProcessor implements IPreProcessor {
  completion = HashNoRun;
  handle(path: string, args: string[]) {
    const file = zGlobal.zsFiles.get(path);
    if (file) {
      file.norun = true;
    }
  }
}

export const NoRunHandler = new NoRunPreProcessor();
