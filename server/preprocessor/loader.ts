import { zGlobal } from '../api/global';
import { IPreProcessor } from '../api/IPreProcessor';
import { HashLoader } from '../completion/preprocessor/loader';

class LoaderPreProcessor implements IPreProcessor {
  completion = HashLoader;
  handle(path: string, args: string[]) {
    if (args.length < 2) {
      return;
    }

    zGlobal.zsFiles.get(path).loader = args[1];
  }
}

export const LoaderHandler = new LoaderPreProcessor();
