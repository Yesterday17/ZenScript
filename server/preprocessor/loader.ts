import { zGlobal } from '../api/global';
import { HashLoader } from '../completion/preprocessor/loader';
import { IPreProcessor } from './IPreProcessor';

class LoaderPreProcessor implements IPreProcessor {
  completion = HashLoader;
  handle(path: string, args: string[]) {
    if (args.length < 2) {
      return;
    }

    const file = zGlobal.zsFiles.get(path);
    if (file) {
      file.loader = args[1];
    }
  }
}

export const LoaderHandler = new LoaderPreProcessor();
