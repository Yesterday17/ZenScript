import { IPreProcessor } from '../api/IPreProcessor';
import { HashIgnoreBracketErrors } from '../completion/preprocessor/ignoreBracketErrors';
import { zGlobal } from '../api/global';

class IgnoreBracketErrorsPreProcessor implements IPreProcessor {
  completion = HashIgnoreBracketErrors;
  handle(path: string, args: string[]) {
    zGlobal.zsFiles.get(path).ignoreBracketErrors = true;
  }
}

export const IgnoreBracketErrorsHandler = new IgnoreBracketErrorsPreProcessor();
