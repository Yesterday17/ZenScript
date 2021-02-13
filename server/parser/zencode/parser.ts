import { CstParser } from 'chevrotain';
import { ZenCodeAllTokens } from './lexer';

class ZenCodeParser extends CstParser {
  constructor() {
    super(ZenCodeAllTokens);
    this.performSelfAnalysis();
  }

  protected ZenCodeFile = this.RULE('ZenCodeFile', () => {
    //
  });
}

export const ZCParser = new ZenCodeParser();
