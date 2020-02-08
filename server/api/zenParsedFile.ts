import { ILexingResult, IToken } from 'chevrotain';
import { readFileSync } from 'fs';
import { URI } from 'vscode-uri';
import { CommentEntry } from '../parser';
import { ZSCommentScanner } from '../parser/zsComment';
import { ZSInterpreter } from '../parser/zsInterpreter';
import { ZSLexer } from '../parser/zsLexer';
import { ZSParser } from '../parser/zsParser';
import { IPriority } from '../preprocessor/priority';
import {
  getPreProcessorList,
  PreProcessorHandlersMap,
  PreProcessors,
} from '../preprocessor/zsPreProcessor';
import { ZSBaseName } from '../utils/path';

export class ZenParsedFile implements IPriority {
  name: string;
  fspath: string;
  get path() {
    return URI.file(this.fspath).toString();
  }
  content: string;

  comments: CommentEntry[];
  private lexResult: ILexingResult;
  tokens: IToken[];

  parseErrors: any[] = [];
  cst: any;
  ast: any;

  priority: number = 0;
  loader: string = '';

  constructor(fspath: string) {
    this.fspath = fspath;
    this.name = ZSBaseName(fspath);
  }

  /**
   * Load file from `this.path`
   */
  load() {
    this.content = readFileSync(this.fspath, { encoding: 'utf8' });
    return this;
  }

  text(text: string) {
    this.content = text;
    return this;
  }

  preprocess() {
    const preProcessors = getPreProcessorList(this.content, PreProcessors);

    preProcessors.forEach(preprocessor => {
      const split = preprocessor.split(' ');
      if (PreProcessorHandlersMap.has(split[0])) {
        PreProcessorHandlersMap.get(split[0]).handle(this.path, split);
      }
    });

    return this;
  }

  /**
   * Parse file, generate cst & ast.
   * @param text the text to parse, undefined if no update
   */
  parse() {
    // Scan & locate comments
    this.comments = ZSCommentScanner.scan(this.content);

    // Lexing
    this.lexResult = ZSLexer.tokenize(this.content);
    this.tokens = this.lexResult.tokens;

    // Parsing
    this.cst = { ...ZSParser.parse(this.tokens) };
    this.parseErrors = [...ZSParser.errors];

    // Interpreting
    this.ast = ZSInterpreter.visit(this.cst);
    return this;
  }
}
