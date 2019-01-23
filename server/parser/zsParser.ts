// This parser follows https://github.com/CraftTweaker/ZenScript/tree/1f3f16efb9abe93a36bb4b7c11d10c27b67fca6f

import { IToken, Parser } from 'chevrotain';
import {
  AND,
  ANY,
  AS,
  ASSIGN,
  A_CLOSE,
  A_OPEN,
  BOOL,
  BR_CLOSE,
  BR_OPEN,
  BYTE,
  COLON,
  COMMA,
  DIV,
  DOT,
  DOT2,
  DOUBLE,
  DOUBLE_QUOTED_STRING,
  ELSE,
  EQ,
  FALSE,
  FLOAT,
  FLOAT_VALUE,
  FOR,
  FUNCTION,
  GLOBAL_ZS,
  GT,
  GTEQ,
  IDENTIFIER,
  IF,
  IMPORT,
  IN,
  INT,
  INT_VALUE,
  LONG,
  LT,
  LTEQ,
  MINUS,
  MOD,
  MUL,
  NOT,
  NOT_EQ,
  NULL,
  OR,
  PLUS,
  PREPROCESSOR,
  QUEST,
  RETURN,
  SEMICOLON,
  SHORT,
  SINGLE_QUOTED_STRING,
  SQBR_CLOSE,
  SQBR_OPEN,
  STATIC,
  STRING,
  TILDE,
  TRUE,
  VAL,
  VAR,
  VERSION,
  VOID,
  XOR,
  zsAllTokens,
  TILDE_ASSIGN,
  STRING_VALUE,
  WHILE,
  BREAK,
} from './zsLexer';

export class ZenScriptParser extends Parser {
  constructor(input: IToken[]) {
    super(zsAllTokens);
    this.input = input;
    this.performSelfAnalysis();
  }

  /**
   * Level 1: Program
   */
  public Program = this.RULE('Program', () => {
    this.SUBRULE(this.ProcessorList);
    this.SUBRULE(this.ImportList);

    this.MANY(() =>
      this.OR([
        { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
        { ALT: () => this.SUBRULE(this.BlockStatement) },
      ])
    );
  });

  /**
   * Level 2
   */
  protected ProcessorList = this.RULE('ProcessorList', () => {
    this.MANY(() => {
      this.CONSUME(PREPROCESSOR);
    });
  });

  protected ImportList = this.RULE('ImportList', () => {
    this.MANY(() => {
      this.CONSUME(IMPORT);
      this.SUBRULE(this.Package);
      this.OPTION(() => {
        this.CONSUME(AS);
        this.CONSUME(IDENTIFIER);
      });
      this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
    });
  });

  /**
   * Function declaration
   */
  protected FunctionDeclaration = this.RULE('FunctionDeclaration', () => {
    this.CONSUME(FUNCTION);
    this.CONSUME(IDENTIFIER);
    this.CONSUME(BR_OPEN);
    this.OPTION(() => {
      this.SUBRULE(this.ParameterList);
    });
    this.CONSUME(BR_CLOSE);
    this.OPTION2(() => {
      this.SUBRULE(this.TypeDeclare);
    });
    this.SUBRULE(this.StatementBody);
  });

  /**
   * Statements (>=1)
   */
  protected BlockStatement = this.RULE('BlockStatement', () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.Statement);
    });
  });

  /**
   * Level 3
   */
  protected Package = this.RULE('Package', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: DOT,
      DEF: () => {
        this.CONSUME(IDENTIFIER);
      },
    });
  });

  protected ParameterList = this.RULE('ParameterList', () => {
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.Parameter),
    });
  });

  /**
   * Multiple statements with {}
   */
  protected StatementBody = this.RULE('StatementBody', () => {
    this.CONSUME(A_OPEN);
    this.SUBRULE(this.BlockStatement);
    this.CONSUME(A_CLOSE);
  });

  /**
   * Single statement
   */
  protected Statement = this.RULE('Statement', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.StatementBody) },
      { ALT: () => this.SUBRULE(this.ReturnStatement) },
      { ALT: () => this.SUBRULE(this.DeclareStatement) },
      { ALT: () => this.SUBRULE(this.IfStatement) },
      { ALT: () => this.SUBRULE(this.ForStatement) },
      { ALT: () => this.SUBRULE(this.WhileStatement) },
      { ALT: () => this.SUBRULE(this.VersionStatement) },
      { ALT: () => this.SUBRULE(this.BreakStatement) },
      { ALT: () => this.SUBRULE(this.ExpressionStatement) },
    ]);
  });

  /**
   * Level 4: Statements
   */

  protected ReturnStatement = this.RULE('ReturnStatement', () => {
    this.CONSUME(RETURN);
    this.SUBRULE(this.Expression);
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected DeclareStatement = this.RULE('DeclareStatement', () => {
    this.OR([
      { ALT: () => this.CONSUME(VAR) }, // let
      { ALT: () => this.CONSUME(VAL) }, // const
    ]);

    this.CONSUME(IDENTIFIER, { ERR_MSG: 'Identifier expected.' });
    this.OPTION(() => {
      this.SUBRULE(this.TypeDeclare);
    });
    this.OPTION2(() => {
      this.CONSUME(ASSIGN);
      this.SUBRULE(this.Expression);
    });
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected IfStatement = this.RULE('IfStatement', () => {
    this.CONSUME(IF);
    this.SUBRULE(this.Expression);
    this.SUBRULE(this.Statement);
    this.OPTION(() => {
      this.CONSUME(ELSE);
      this.SUBRULE2(this.Statement);
    });
  });

  protected ForStatement = this.RULE('ForStatement', () => {
    this.CONSUME(FOR);
    this.AT_LEAST_ONE_SEP({
      SEP: COMMA,
      DEF: () => {
        this.CONSUME(IDENTIFIER, { ERR_MSG: 'Identifier expected' });
      },
    });
    this.CONSUME(IN);
    this.SUBRULE(this.Expression);
    this.SUBRULE(this.Statement);
  });

  protected WhileStatement = this.RULE('WhileStatement', () => {
    this.CONSUME(WHILE);
    this.SUBRULE(this.Expression);
    this.SUBRULE(this.Statement);
  });

  protected VersionStatement = this.RULE('WhileStatement', () => {
    this.CONSUME(VERSION);
    this.CONSUME(INT_VALUE, { ERR_MSG: 'INT_VALUE expected' });
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected BreakStatement = this.RULE('WhileStatement', () => {
    this.CONSUME(BREAK);
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected ExpressionStatement = this.RULE('WhileStatement', () => {
    this.SUBRULE(this.Expression);
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  /**
   * Level 5: Expressions
   */
  protected Expression = this.RULE('Expression', () => {
    // UnaryExpression
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(NOT) },
        { ALT: () => this.CONSUME(MINUS) },
      ]);
    });
  });

  protected UnaryExpression = this.RULE('UnaryExpression', () => {
    this.OR([
      { ALT: () => this.CONSUME(NOT) },
      { ALT: () => this.CONSUME(MINUS) },
    ]);
    this.SUBRULE(this.PostfixExpression);
  });

  protected PostfixExpression = this.RULE('PostfixExpression', () => {
    this.SUBRULE(this.PrimaryExpression);
  });

  protected PrimaryExpression = this.RULE('PrimaryExpression', () => {
    this.OR([
      { ALT: () => this.CONSUME(INT_VALUE) },
      { ALT: () => this.CONSUME(FLOAT_VALUE) },
      { ALT: () => this.CONSUME(STRING_VALUE) },
      { ALT: () => this.CONSUME(IDENTIFIER) },
      // TODO: Lambda Function
      // { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
      // { ALT: () => this.SUBRULE(this.BracketHandler) },
      // TODO: ParsedExpression.java Line 394 T_SQBROPEN
      // TODO: ParsedExpression.java Line 408 T_AOPEN
      { ALT: () => this.CONSUME(TRUE) },
      { ALT: () => this.CONSUME(FALSE) },
      { ALT: () => this.CONSUME(NULL) },
      // TODO: ParsedExpression.java Line 436 T_BROPEN
      // { ALT: () => this.CONSUME(STRING_VALUE) }
    ]);
  });

  /**
   * Level 6 Others
   */

  protected Parameter = this.RULE('Parameter', () => {
    this.CONSUME(IDENTIFIER);
    this.OPTION(() => {
      this.SUBRULE(this.TypeDeclare);
    });
  });

  protected TypeDeclare = this.RULE('TypeDeclare', () => {
    this.CONSUME(AS);
    this.SUBRULE(this.TypeAnnotation);
  });

  protected TypeAnnotation = this.RULE('TypeAnnotation', () => {
    this.OR([
      { ALT: () => this.CONSUME(INT) },
      { ALT: () => this.CONSUME(BOOL) },
      { ALT: () => this.CONSUME(BYTE) },
      { ALT: () => this.CONSUME(FLOAT) },
      { ALT: () => this.CONSUME(DOUBLE) },
      { ALT: () => this.CONSUME(LONG) },
      { ALT: () => this.CONSUME(NULL) },
      { ALT: () => this.CONSUME(SHORT) },
      { ALT: () => this.CONSUME(STRING) },
      { ALT: () => this.CONSUME(VOID) },
      { ALT: () => this.CONSUME(IDENTIFIER) },
    ]);
  });
}
