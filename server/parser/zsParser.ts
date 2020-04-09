// This parser follows https://github.com/CraftTweaker/ZenScript/tree/1f3f16efb9abe93a36bb4b7c11d10c27b67fca6f

import { IToken, Parser } from 'chevrotain';
import {
  AND,
  AND2,
  AND_ASSIGN,
  ANY,
  AS,
  ASSIGN,
  A_CLOSE,
  A_OPEN,
  BOOL,
  BREAK,
  BR_CLOSE,
  BR_OPEN,
  BYTE,
  COLON,
  COMMA,
  DIV,
  DIV_ASSIGN,
  DOLLAR,
  DOT,
  DOT2,
  DOUBLE,
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
  INSTANCEOF,
  INT,
  INT_VALUE,
  LONG,
  LT,
  LTEQ,
  MINUS,
  MINUS_ASSIGN,
  MOD,
  MOD_ASSIGN,
  MUL,
  MUL_ASSIGN,
  NOT,
  NOT_EQ,
  NULL,
  OR,
  OR2,
  OR_ASSIGN,
  PLUS,
  PLUS_ASSIGN,
  QUEST,
  RETURN,
  SEMICOLON,
  SHORT,
  SQBR_CLOSE,
  SQBR_OPEN,
  STATIC,
  STRING,
  STRING_VALUE,
  TILDE,
  TILDE_ASSIGN,
  TRUE,
  VAL,
  VAR,
  VERSION,
  VOID,
  WHILE,
  XOR,
  XOR_ASSIGN,
  ZEN_CLASS,
  ZEN_CONSTRUCTOR,
  zsAllTokens,
} from './zsLexer';

export class ZenScriptParser extends Parser {
  constructor() {
    super(zsAllTokens, {
      maxLookahead: 2,
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  parse(input: IToken[]) {
    this.input = input;
    return this.Program();
  }

  /**
   * Level 1: Program
   * =================================================================================================
   */
  protected Program = this.RULE('Program', () => {
    this.MANY(() => {
      this.SUBRULE(this.ImportStatement);
    });

    this.MANY2(() =>
      this.OR([
        { ALT: () => this.SUBRULE(this.GlobalStaticDeclaration) },
        { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
        { ALT: () => this.SUBRULE(this.ZenClassDeclaration) },
        { ALT: () => this.SUBRULE(this.Statement) },
      ])
    );
  });

  /**
   * Level 2
   * =================================================================================================
   */

  protected ImportStatement = this.RULE('ImportStatement', () => {
    this.CONSUME(IMPORT);
    this.SUBRULE(this.Package);
    this.OPTION(() => {
      this.CONSUME(AS);
      this.CONSUME(IDENTIFIER, { LABEL: 'alias' });
    });
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  /**
   * Global / Static
   */
  protected GlobalStaticDeclaration = this.RULE(
    'GlobalStaticDeclaration',
    () => {
      this.OR([
        { ALT: () => this.CONSUME(GLOBAL_ZS) },
        { ALT: () => this.CONSUME(STATIC) },
      ]);
      this.CONSUME(IDENTIFIER, {
        LABEL: 'vName',
        ERR_MSG: 'Identifier expected.',
      });
      this.OPTION(() => {
        this.SUBRULE(this.TypeDeclare, { LABEL: 'vType' });
      });
      this.CONSUME(ASSIGN, {
        ERR_MSG: 'Global and Static variables must be initialized.',
      });
      this.SUBRULE(this.Expression, { LABEL: 'value' });
      this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
    }
  );

  /**
   * Function declaration
   */
  protected FunctionDeclaration = this.RULE('FunctionDeclaration', () => {
    this.CONSUME(FUNCTION);
    this.CONSUME(IDENTIFIER, {
      LABEL: 'FunctionName',
      ERR_MSG: 'Identifier Expected.',
    });
    this.CONSUME(BR_OPEN, { ERR_MSG: `Missing '('` });
    this.OPTION(() => {
      this.SUBRULE(this.ParameterList);
    });
    this.CONSUME(BR_CLOSE, { ERR_MSG: `Missing ')'` });
    this.OPTION2(() => {
      this.SUBRULE(this.TypeDeclare);
    });
    this.SUBRULE(this.StatementBody);
  });

  protected ZenClassDeclaration = this.RULE('ZenClassDeclaration', () => {
    this.CONSUME(ZEN_CLASS);
    this.CONSUME(IDENTIFIER, {
      LABEL: 'name',
      ERR_MSG: 'ClassName required',
    });
    this.CONSUME(A_OPEN, { ERR_MSG: '{ expected' });
    // TODO: reuse code
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.OR2([
              { ALT: () => this.CONSUME(VAR) },
              { ALT: () => this.CONSUME(VAL) },
              { ALT: () => this.CONSUME(STATIC) },
            ]);
            this.CONSUME2(IDENTIFIER, {
              ERR_MSG: 'Identifier expected',
            });
            this.OPTION(() => {
              this.SUBRULE(this.TypeDeclare);
            });
            this.OPTION2(() => {
              this.CONSUME(ASSIGN, {
                ERR_MSG: 'Global and Static variables must be initialized.',
              });
              this.SUBRULE(this.Expression);
            });
            this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
          },
        },
        {
          ALT: () => {
            this.CONSUME(ZEN_CONSTRUCTOR);
            this.CONSUME(BR_OPEN, { ERR_MSG: `Missing '('` });
            this.OPTION3(() => {
              this.SUBRULE(this.ParameterList);
            });
            this.CONSUME(BR_CLOSE, { ERR_MSG: `Missing ')'` });
            this.OPTION4(() => {
              this.SUBRULE2(this.TypeDeclare);
            });
            this.SUBRULE(this.StatementBody);
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.FunctionDeclaration);
          },
        },
      ]);
    });
    this.CONSUME(A_CLOSE, { ERR_MSG: '} expected' });
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
   * =================================================================================================
   */

  /**
   * Multiple statements with {}
   */
  protected StatementBody = this.RULE('StatementBody', () => {
    this.CONSUME(A_OPEN);
    this.OPTION(() => {
      this.SUBRULE(this.BlockStatement);
    });
    this.CONSUME(A_CLOSE);
  });

  /**
   * Single statement
   */
  protected Statement = this.RULE('Statement', () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === A_OPEN,
        ALT: () => this.SUBRULE(this.StatementBody, { LABEL: 'component' }),
      },
      {
        // GATE: this.LA(1).tokenType === RETURN,
        ALT: () => this.SUBRULE(this.ReturnStatement, { LABEL: 'component' }),
      },
      {
        GATE: () =>
          this.LA(1).tokenType === VAL || this.LA(1).tokenType === VAR,
        ALT: () => this.SUBRULE(this.DeclareStatement, { LABEL: 'component' }),
      },
      { ALT: () => this.SUBRULE(this.IfStatement, { LABEL: 'component' }) },
      { ALT: () => this.SUBRULE(this.ForStatement, { LABEL: 'component' }) },
      { ALT: () => this.SUBRULE(this.WhileStatement, { LABEL: 'component' }) },
      {
        ALT: () => this.SUBRULE(this.VersionStatement, { LABEL: 'component' }),
      },
      { ALT: () => this.SUBRULE(this.BreakStatement, { LABEL: 'component' }) },
      {
        ALT: () =>
          this.SUBRULE(this.ExpressionStatement, { LABEL: 'component' }),
      },
    ]);
  });

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement = this.RULE('ReturnStatement', () => {
    this.CONSUME(RETURN);
    this.OPTION(() => {
      this.SUBRULE(this.Expression);
    });
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected DeclareStatement = this.RULE('DeclareStatement', () => {
    this.OR([
      { ALT: () => this.CONSUME(VAR) }, // let
      { ALT: () => this.CONSUME(VAL) }, // const
    ]);

    this.CONSUME(IDENTIFIER, {
      ERR_MSG: 'Identifier expected.',
    });
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
    this.CONSUME(BR_OPEN);
    this.SUBRULE(this.AssignExpression);
    this.CONSUME(BR_CLOSE);
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
        this.CONSUME(IDENTIFIER, {
          ERR_MSG: 'Identifier expected',
        });
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

  protected VersionStatement = this.RULE('VersionStatement', () => {
    this.CONSUME(VERSION);
    this.CONSUME(INT_VALUE, { ERR_MSG: 'INT_VALUE expected' });
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected BreakStatement = this.RULE('BreakStatement', () => {
    this.CONSUME(BREAK);
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected ExpressionStatement = this.RULE('ExpressionStatement', () => {
    this.SUBRULE(this.Expression);
    this.CONSUME(SEMICOLON, { ERR_MSG: '; expected' });
  });

  /**
   * Level 5: Expressions
   * =================================================================================================
   */
  protected Expression = this.RULE('Expression', () => {
    this.SUBRULE(this.AssignExpression, { LABEL: 'expression' });
  });

  protected AssignExpression = this.RULE('AssignExpression', () => {
    this.SUBRULE(this.ConditionalExpression, { LABEL: 'lhs' });
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(PLUS_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MINUS_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(TILDE_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MUL_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(DIV_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MOD_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(OR_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(AND_ASSIGN, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(XOR_ASSIGN, { LABEL: 'operator' }) },
      ]);
      this.SUBRULE(this.AssignExpression, { LABEL: 'rhs' });
    });
  });

  protected UnaryExpression = this.RULE('UnaryExpression', () => {
    this.OR([
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(NOT, { LABEL: 'operator' }) },
            { ALT: () => this.CONSUME(MINUS, { LABEL: 'operator' }) },
          ]);
          this.SUBRULE(this.UnaryExpression, { LABEL: 'expression' });
        },
      },
      {
        ALT: () => {
          this.SUBRULE(this.PostfixExpression, { LABEL: 'expression' });
        },
      },
    ]);
  });

  protected AddExpression = this.RULE('AddExpression', () => {
    this.SUBRULE(this.MultiplyExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(PLUS, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MINUS, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(TILDE, { LABEL: 'operator' }) }, // TILDE can be used to concat strings
      ]);
      this.SUBRULE2(this.MultiplyExpression);
    });
  });

  protected MultiplyExpression = this.RULE('MultiplyExpression', () => {
    this.SUBRULE(this.UnaryExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(MUL, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(DIV, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(MOD, { LABEL: 'operator' }) },
      ]);
      this.SUBRULE2(this.UnaryExpression);
    });
  });

  protected CompareExpression = this.RULE('CompareExpression', () => {
    this.SUBRULE(this.AddExpression);
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(EQ, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(NOT_EQ, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(LT, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(LTEQ, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(GT, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(GTEQ, { LABEL: 'operator' }) },
        { ALT: () => this.CONSUME(IN, { LABEL: 'operator' }) },
      ]);
      this.SUBRULE2(this.AddExpression);
    });
  });

  protected AndExpression = this.RULE('AndExpression', () => {
    this.SUBRULE(this.CompareExpression);
    this.MANY(() => {
      this.CONSUME(AND);
      this.SUBRULE2(this.CompareExpression);
    });
  });

  protected AndAndExpression = this.RULE('AndAndExpression', () => {
    this.SUBRULE(this.OrExpression);
    this.MANY(() => {
      this.CONSUME(AND2);
      this.SUBRULE2(this.OrExpression);
    });
  });

  protected OrExpression = this.RULE('OrExpression', () => {
    this.SUBRULE(this.XorExpression);
    this.MANY(() => {
      this.CONSUME(OR);
      this.SUBRULE2(this.XorExpression);
    });
  });

  protected OrOrExpression = this.RULE('OrOrExpression', () => {
    this.SUBRULE(this.AndAndExpression);
    this.MANY(() => {
      this.CONSUME(OR2);
      this.SUBRULE2(this.AndAndExpression);
    });
  });

  protected XorExpression = this.RULE('XorExpression', () => {
    this.SUBRULE(this.AndExpression);
    this.MANY(() => {
      this.CONSUME(XOR);
      this.SUBRULE2(this.AndExpression);
    });
  });

  protected ConditionalExpression = this.RULE('ConditionalExpression', () => {
    this.SUBRULE(this.OrOrExpression);
    this.OPTION(() => {
      this.CONSUME(QUEST);
      this.SUBRULE2(this.OrOrExpression);
      this.CONSUME(COLON, { ERR_MSG: ': expected' });
      this.SUBRULE(this.ConditionalExpression);
    });
  });

  protected PostfixExpression = this.RULE('PostfixExpression', () => {
    this.SUBRULE(this.PrimaryExpression);
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(DOT);
            this.OR2([
              { ALT: () => this.CONSUME(IDENTIFIER, { LABEL: 'property' }) },
              { ALT: () => this.CONSUME(VERSION, { LABEL: 'property' }) },
              { ALT: () => this.CONSUME(STRING, { LABEL: 'property' }) },
            ]);
          },
        },
        {
          GATE: () =>
            this.LA(1).tokenType === IDENTIFIER && this.LA(1).image === 'to',
          ALT: () => {
            this.CONSUME2(IDENTIFIER);
            this.SUBRULE(this.AssignExpression, { LABEL: 'to' });
          },
        },
        {
          ALT: () => {
            this.CONSUME(DOT2);
            this.SUBRULE2(this.AssignExpression, { LABEL: 'dotdot' });
          },
        },
        {
          ALT: () => {
            this.CONSUME(SQBR_OPEN);
            this.SUBRULE3(this.AssignExpression, { LABEL: 'index' });
            this.CONSUME(SQBR_CLOSE);
            this.OPTION(() => {
              this.CONSUME(ASSIGN);
              this.SUBRULE4(this.AssignExpression, { LABEL: 'indexAssign' });
            });
          },
        },
        {
          ALT: () => {
            this.CONSUME(BR_OPEN);
            this.MANY_SEP({
              SEP: COMMA,
              DEF: () => {
                this.SUBRULE5(this.AssignExpression, {
                  LABEL: 'brExpressions',
                });
              },
            });
            this.CONSUME(BR_CLOSE);
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.TypeDeclare, { LABEL: 'type' });
          },
        },
        {
          ALT: () => {
            this.CONSUME(INSTANCEOF);
            this.SUBRULE(this.TypeAnnotation, { LABEL: 'instanceof' });
          },
        },
      ]);
    });
  });

  protected PrimaryExpression = this.RULE('PrimaryExpression', () => {
    this.OR([
      { ALT: () => this.CONSUME(INT_VALUE, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(FLOAT_VALUE, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(STRING_VALUE, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(IDENTIFIER, { LABEL: 'identifier' }) },
      {
        ALT: () => this.SUBRULE(this.LambdaFunctionDeclaration),
      },
      { ALT: () => this.SUBRULE(this.BracketHandler) },
      { ALT: () => this.SUBRULE(this.ZSArray) },
      { ALT: () => this.SUBRULE(this.ZSMap) },
      { ALT: () => this.CONSUME(TRUE, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(FALSE, { LABEL: 'literal' }) },
      { ALT: () => this.CONSUME(NULL, { LABEL: 'literal' }) },
      {
        ALT: () => {
          this.CONSUME(BR_OPEN);
          this.SUBRULE(this.AssignExpression);
          this.CONSUME(BR_CLOSE);
        },
      },
    ]);
  });

  /**
   * Level 6 Others
   * =================================================================================================
   */
  protected LambdaFunctionDeclaration = this.RULE(
    'LambdaFunctionDeclaration',
    () => {
      this.CONSUME(FUNCTION);
      this.CONSUME(BR_OPEN);
      this.OPTION(() => {
        this.SUBRULE(this.ParameterList);
      });
      this.CONSUME(BR_CLOSE);
      this.OPTION2(() => {
        this.SUBRULE(this.TypeDeclare);
      });
      this.SUBRULE(this.StatementBody);
    }
  );

  protected BracketHandler = this.RULE('BracketHandler', () => {
    this.CONSUME(LT);
    this.AT_LEAST_ONE_SEP({
      SEP: COLON,
      DEF: () => {
        this.AT_LEAST_ONE({
          NAME: '$BracketHandlerItemGroup',
          DEF: () => {
            this.OR([
              { ALT: () => this.CONSUME(IDENTIFIER, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(FLOAT_VALUE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(INT_VALUE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(STRING_VALUE, { LABEL: 'part' }) },

              { ALT: () => this.CONSUME(ANY, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(BOOL, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(BYTE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(SHORT, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(INT, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(LONG, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(FLOAT, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(DOUBLE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(STRING, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(FUNCTION, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(IN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(VOID, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(AS, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(VERSION, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(IF, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(ELSE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(FOR, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(RETURN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(VAR, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(VAL, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(GLOBAL_ZS, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(STATIC, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(INSTANCEOF, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(WHILE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(BREAK, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(NULL, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(TRUE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(FALSE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(IMPORT, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(ZEN_CLASS, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(ZEN_CONSTRUCTOR, { LABEL: 'part' }) },

              { ALT: () => this.CONSUME(A_OPEN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(A_CLOSE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(SQBR_OPEN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(SQBR_CLOSE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(DOT2, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(DOT, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(COMMA, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(PLUS_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(PLUS, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(MINUS_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(MINUS, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(MUL_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(MUL, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(DIV_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(DIV, { LABEL: 'part' }) }, // #7
              { ALT: () => this.CONSUME(MOD_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(MOD, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(OR_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(OR2, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(OR, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(AND_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(AND2, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(AND, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(XOR_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(XOR, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(QUEST, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(BR_OPEN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(BR_CLOSE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(TILDE_ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(TILDE, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(SEMICOLON, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(EQ, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(ASSIGN, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(NOT_EQ, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(NOT, { LABEL: 'part' }) },
              { ALT: () => this.CONSUME(DOLLAR, { LABEL: 'part' }) },
            ]);
          },
        });
      },
    });
    this.CONSUME(GT);
  });

  protected ZSArray = this.RULE('ZSArray', () => {
    this.CONSUME(SQBR_OPEN);
    this.OPTION(() => {
      this.SUBRULE(this.AssignExpression);
      this.MANY(() => {
        this.CONSUME(COMMA);
        this.SUBRULE2(this.AssignExpression);
      });
      this.OPTION2(() => {
        this.CONSUME2(COMMA);
      });
    });
    this.CONSUME(SQBR_CLOSE);
  });

  protected ZSMap = this.RULE('ZSMap', () => {
    this.CONSUME(A_OPEN);
    this.OPTION(() => {
      this.SUBRULE(this.ZSMapEntry);
      this.MANY(() => {
        this.CONSUME(COMMA);
        this.SUBRULE2(this.ZSMapEntry);
      });
      this.OPTION2(() => {
        this.CONSUME2(COMMA);
      });
    });
    this.CONSUME(A_CLOSE);
  });

  protected ZSMapEntry = this.RULE('ZSMapEntry', () => {
    this.SUBRULE(this.AssignExpression, { LABEL: 'KEY' });
    this.CONSUME(COLON);
    this.SUBRULE2(this.AssignExpression, { LABEL: 'VALUE' });
  });

  protected Package = this.RULE('Package', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: DOT,
      DEF: () => {
        this.OR({
          DEF: [
            { ALT: () => this.CONSUME(IDENTIFIER) },

            { ALT: () => this.CONSUME(ANY) },
            { ALT: () => this.CONSUME(BOOL) },
            { ALT: () => this.CONSUME(BYTE) },
            { ALT: () => this.CONSUME(SHORT) },
            { ALT: () => this.CONSUME(INT) },
            { ALT: () => this.CONSUME(LONG) },
            { ALT: () => this.CONSUME(FLOAT) },
            { ALT: () => this.CONSUME(DOUBLE) },
            { ALT: () => this.CONSUME(STRING) },
            { ALT: () => this.CONSUME(FUNCTION) },
            { ALT: () => this.CONSUME(IN) },
            { ALT: () => this.CONSUME(VOID) },
            { ALT: () => this.CONSUME(AS) },
            { ALT: () => this.CONSUME(VERSION) },
            { ALT: () => this.CONSUME(IF) },
            { ALT: () => this.CONSUME(ELSE) },
            { ALT: () => this.CONSUME(FOR) },
            { ALT: () => this.CONSUME(RETURN) },
            { ALT: () => this.CONSUME(VAR) },
            { ALT: () => this.CONSUME(VAL) },
            { ALT: () => this.CONSUME(GLOBAL_ZS) },
            { ALT: () => this.CONSUME(STATIC) },
            { ALT: () => this.CONSUME(INSTANCEOF) },
            { ALT: () => this.CONSUME(WHILE) },
            { ALT: () => this.CONSUME(BREAK) },
            { ALT: () => this.CONSUME(NULL) },
            { ALT: () => this.CONSUME(TRUE) },
            { ALT: () => this.CONSUME(FALSE) },
            { ALT: () => this.CONSUME(IMPORT) },
            { ALT: () => this.CONSUME(ZEN_CLASS) },
            { ALT: () => this.CONSUME(ZEN_CONSTRUCTOR) },
          ],
        });
      },
    });
  });

  protected ParameterList = this.RULE('ParameterList', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.Parameter),
    });
  });

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
    this.OR({
      DEF: [
        { ALT: () => this.CONSUME(ANY) },
        { ALT: () => this.CONSUME(VOID) },
        { ALT: () => this.CONSUME(BOOL) },
        { ALT: () => this.CONSUME(BYTE) },
        { ALT: () => this.CONSUME(SHORT) },
        { ALT: () => this.CONSUME(INT) },
        { ALT: () => this.CONSUME(LONG) },
        { ALT: () => this.CONSUME(FLOAT) },
        { ALT: () => this.CONSUME(DOUBLE) },
        { ALT: () => this.CONSUME(STRING) },
        {
          ALT: () => {
            this.AT_LEAST_ONE_SEP({
              SEP: DOT,
              DEF: () => {
                this.CONSUME(IDENTIFIER);
              },
            });
          },
        },
        {
          ALT: () => {
            this.CONSUME(FUNCTION);
            this.CONSUME(BR_OPEN);
            this.MANY_SEP({
              SEP: COMMA,
              DEF: () => {
                this.SUBRULE(this.TypeAnnotation, {
                  LABEL: 'ParameterType',
                });
              },
            });
            this.CONSUME(BR_CLOSE);
            this.SUBRULE2(this.TypeAnnotation, {
              LABEL: 'FunctionType',
            });
          },
        },
        {
          ALT: () => {
            this.CONSUME(SQBR_OPEN);
            this.SUBRULE3(this.TypeAnnotation, {
              LABEL: 'ArrayType',
            });
            this.CONSUME(SQBR_CLOSE);
          },
        },
      ],
      ERR_MSG: 'Must be a type.',
    });
    this.MANY(() => {
      this.CONSUME2(SQBR_OPEN);
      this.OPTION(() => {
        this.SUBRULE4(this.TypeAnnotation, {
          LABEL: 'ZenTypeAssociative',
        });
      });
      this.CONSUME2(SQBR_CLOSE);
    });
  });
}

export const ZSParser = new ZenScriptParser();
