import {
  CstNode,
  ILexingResult,
  IRecognitionException,
  IToken,
} from 'chevrotain';
import set from 'set-value';
import { Connection } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { ASTBasicProgram, ASTError, ASTNodeProgram } from '../parser/zenscript';
import { ZSBasicInterpreter } from '../parser/zenscript/zsBasicInterpreter';
import { ZSInterpreter } from '../parser/zenscript/zsInterpreter';
import { ZSLexer } from '../parser/zenscript/zsLexer';
import { ZSParser } from '../parser/zenscript/zsParser';
import { IPriority } from '../preprocessor/priority';
import { preparePreprocessors } from '../preprocessor/zsPreProcessor';
import * as fs from '../utils/fs';
import * as path from '../utils/path';
import { zGlobal } from './global';

enum ParseStep {
  NotLoaded = 0,
  Loaded = 1,
  Preprocessed = 2,
  Parsed = 3,
}

export class ZenParsedFile implements IPriority {
  name: string;
  uri: URI;
  pkg: string; // package: scripts.xx.yy
  private connection: Connection;

  get path(): string {
    return this.uri.toString();
  }
  content: string;

  private step: ParseStep = ParseStep.NotLoaded;
  get isInterpreted(): boolean {
    return this.step === ParseStep.Parsed;
  }

  comments: IToken[];
  private lexResult: ILexingResult;
  tokens: IToken[];

  parseErrors: IRecognitionException[] = [];
  interpreteErrors: ASTError[] = [];
  cst: CstNode;
  basicAst: ASTBasicProgram;
  ast: ASTNodeProgram;
  bracketHandlers: any;

  priority = 0;
  ignoreBracketErrors = false;
  loader = 'crafttweaker';
  norun = false;
  nowarn = false;

  constructor(uri: URI, pkg: string, connection: Connection) {
    this.uri = uri;
    this.pkg = pkg;
    this.connection = connection;
    this.name = path.basename(uri);
  }

  /**
   * Load file from `this.path`
   */
  async load(): Promise<void> {
    this.content = await fs.readFileString(this.uri, this.connection);
    this.step = ParseStep.Loaded;
  }

  text(text: string): ZenParsedFile {
    this.content = text;
    this.step = ParseStep.Loaded;
    return this;
  }

  parse(): ZenParsedFile {
    // Lexing
    this.lexResult = ZSLexer.tokenize(this.content);
    this.comments = this.lexResult.groups['COMMENT'];
    this.tokens = this.lexResult.tokens.filter(
      (t) => !this.comments.includes(t)
    );

    // Preprocess
    preparePreprocessors(this.comments, this.path);
    this.step = ParseStep.Preprocessed;

    // Parsing
    this.cst = { ...ZSParser.parse(this.tokens) };
    this.parseErrors = [...ZSParser.errors];

    // Basic interprete
    if (this.parseErrors.length === 0) {
      this.basicAst = ZSBasicInterpreter.visit(this.cst);
      for (const val in this.basicAst.scope) {
        set(zGlobal.directory, this.pkg + '.' + val, this.basicAst.scope[val]);
      }
    }

    return this;
  }

  /**
   * Interprete file, generate ast.
   */
  interprete(): ZenParsedFile {
    if (this.parseErrors.length === 0) {
      // Interpreting
      this.interpreteErrors.length = 0;
      this.ast = ZSInterpreter.visit(this.cst, this.interpreteErrors);
      console.log(this.ast);
    }

    this.step = ParseStep.Parsed;
    return this;
  }
}
