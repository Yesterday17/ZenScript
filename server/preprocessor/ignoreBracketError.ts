import { IPreProcessor } from '../api/IPreProcessor';
import { HashIgnoreBracketError } from '../completion/preprocessor/ignoreBracketError';
import { zGlobal } from '../api/global';

class IgnoreBracketErrorPreProcessor implements IPreProcessor {
  completion = HashIgnoreBracketError;
  handle(path: string, args: string[]) {
    zGlobal.zsFiles.get(path).ignoreBracketError = true;
  }
}

export const IgnoreBracketErrorHandler = new IgnoreBracketErrorPreProcessor();
