import { zGlobal } from '../api/global';
import { HashIgnoreBracketErrors } from '../completion/preprocessor/ignoreBracketErrors';
import { IPreProcessor } from './IPreProcessor';

class IgnoreBracketErrorsPreProcessor implements IPreProcessor {
  completion = HashIgnoreBracketErrors;
  handle(path: string, args: string[]) {
    const file = zGlobal.zsFiles.get(path);
    if (file) {
      file.ignoreBracketErrors = true;
    }
  }
}

export const IgnoreBracketErrorsHandler = new IgnoreBracketErrorsPreProcessor();
