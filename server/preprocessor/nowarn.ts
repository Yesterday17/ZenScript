import { zGlobal } from '../api/global';
import { HashNoWarn } from '../completion/preprocessor/nowarn';
import { IPreProcessor } from './IPreProcessor';

class NoWarnPreProcessor implements IPreProcessor {
  completion = HashNoWarn;
  handle(path: string, args: string[]) {
    zGlobal.zsFiles.get(path).nowarn = true;
  }
}

export const NoWarnHandler = new NoWarnPreProcessor();
