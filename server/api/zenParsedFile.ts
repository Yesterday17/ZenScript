import { ILexingResult, IToken } from 'chevrotain';
import { Connection } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { ZSInterpreter } from '../parser/zsInterpreter';
import { ZSLexer } from '../parser/zsLexer';
import { ZSParser } from '../parser/zsParser';
import { IPriority } from '../preprocessor/priority';
import { preparePreprocessors } from '../preprocessor/zsPreProcessor';
import * as fs from '../utils/fs';
import * as path from '../utils/path';

enum ParseStep {
  NotLoaded = 0,
  Loaded = 1,
  Preprocessed = 2,
  Parsed = 3,
}

export class ZenParsedFile implements IPriority {
  name: string;
  uri: URI;
  private connection: Connection;

  get path() {
    return this.uri.toString();
  }
  content: string;

  private step: ParseStep = ParseStep.NotLoaded;
  get isParsed() {
    return this.step === ParseStep.Parsed;
  }

  comments: IToken[];
  private lexResult: ILexingResult;
  tokens: IToken[];

  parseErrors: any[] = [];
  interpreteErrors: any[] = [];
  cst: any;
  ast: any;
  bracketHandlers: any;

  priority: number = 0;
  ignoreBracketErrors: boolean = false;
  loader: string = 'crafttweaker';
  norun: boolean = false;
  nowarn: boolean = false;

  constructor(uri: URI, connection: Connection) {
    this.uri = uri;
    this.connection = connection;
    this.name = path.basename(uri);
  }

  /**
   * Load file from `this.path`
   */
  async load() {
    this.content = await fs.readFileString(this.uri, this.connection);
    this.step = ParseStep.Loaded;
  }

  text(text: string) {
    this.content = text;
    this.step = ParseStep.Loaded;
    return this;
  }

  lex() {
    // Lexing
    this.lexResult = ZSLexer.tokenize(this.content);
    this.comments = this.lexResult.groups['COMMENT'];
    this.tokens = this.lexResult.tokens.filter(t => !this.comments.includes(t));

    // Preprocess
    preparePreprocessors(this.comments, this.path);
    this.step = ParseStep.Preprocessed;
    return this;
  }

  /**
   * Parse file, generate cst & ast.
   */
  parse() {
    // Parsing
    this.cst = { ...ZSParser.parse(this.tokens) };
    this.parseErrors = [...ZSParser.errors];

    if (this.parseErrors.length === 0) {
      // Interpreting
      this.ast = ZSInterpreter.visit(this.cst);
      this.interpreteErrors = this.ast.errors;

      // TODO: BracketHandler Error
    }

    this.step = ParseStep.Parsed;
    return this;
  }
}
