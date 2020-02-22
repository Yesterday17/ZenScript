import { IPreProcessor } from '../api/IPreProcessor';
import { HashNoWarn } from '../completion/preprocessor/nowarn';
import { zGlobal } from '../api/global';

class NoWarnPreProcessor implements IPreProcessor {
  completion = HashNoWarn;
  handle(path: string, args: string[]) {
    zGlobal.zsFiles.get(path).nowarn = true;
  }
}

export const NoWarnHandler = new NoWarnPreProcessor();
