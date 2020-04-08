import { zGlobal } from '../api/global';
import { HashIgnoreBracketErrors } from '../completion/preprocessor/ignoreBracketErrors';
import { IPreProcessor } from './IPreProcessor';

class IgnoreBracketErrorsPreProcessor implements IPreProcessor {
  completion = HashIgnoreBracketErrors;
  handle(path: string, args: string[]) {
    zGlobal.zsFiles.get(path).ignoreBracketErrors = true;
  }
}

export const IgnoreBracketErrorsHandler = new IgnoreBracketErrorsPreProcessor();
