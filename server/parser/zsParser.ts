// This parser follows https://github.com/CraftTweaker/ZenScript/tree/1f3f16efb9abe93a36bb4b7c11d10c27b67fca6f

import { IToken, Parser } from "chevrotain";
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
  zsAllTokens
} from "./zsLexer";

export class ZenScriptParser extends Parser {
  constructor(input: IToken[]) {
    super(zsAllTokens, {
      recoveryEnabled: false,
      maxLookahead: 4,
      ignoredIssues: {}
    });
    this.input = input;
    this.performSelfAnalysis();
  }

  /**
   * Level 1: Program
   */
  public Program = this.RULE("Program", () => {
    this.SUBRULE(this.ProcessorList);
    this.SUBRULE(this.ImportList);

    this.MANY(() =>
      this.OR([
        { ALT: () => this.SUBRULE(this.FunctionDeclaration) },
        { ALT: () => this.SUBRULE(this.BlockStatement) }
      ])
    );
  });

  /**
   * Level 2
   */
  protected ProcessorList = this.RULE("ProcessorList", () => {
    this.MANY(() => {
      this.CONSUME(PREPROCESSOR);
    });
  });

  protected ImportList = this.RULE("ImportList", () => {
    this.MANY(() => {
      this.CONSUME(IMPORT);
      this.SUBRULE(this.Package);
      this.OPTION(() => {
        this.CONSUME(AS);
        this.CONSUME(IDENTIFIER);
      });
      this.CONSUME(SEMICOLON);
    });
  });

  protected BlockStatement = this.RULE("BlockStatement", () => {
    this.SUBRULE(this.Statement);
    this.OPTION(() => {
      this.SUBRULE(this.BlockStatement);
    });
  });

  protected FunctionDeclaration = this.RULE("FunctionDeclaration", () => {
    this.CONSUME(FUNCTION);
    this.CONSUME(IDENTIFIER);
    this.CONSUME(BR_OPEN);
    this.OPTION(() => {
      this.SUBRULE(this.ParameterList);
    });
    this.CONSUME(BR_CLOSE);
    this.OPTION(() => {
      this.SUBRULE(this.TypeDeclare);
    });
    this.SUBRULE(this.StatementBody);
  });

  /**
   * Level 3
   */
  protected Package = this.RULE("Package", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: DOT,
      DEF: () => {
        this.CONSUME(IDENTIFIER);
      }
    });
  });

  protected ParameterList = this.RULE("ParameterList", () => {
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => this.SUBRULE(this.Parameter)
    });
  });

  protected StatementBody = this.RULE("StatementBody", () => {
    this.CONSUME(A_OPEN);
    this.SUBRULE(this.BlockStatement);
    this.CONSUME(A_CLOSE);
  });

  protected Statement = this.RULE("Statement", () => {
    this.MANY(() =>
      this.OR([
        { ALT: () => this.SUBRULE(this.AssignStatement) },
        { ALT: () => this.SUBRULE(this.ReturnStatement) },
        {
          ALT: () => {
            this.SUBRULE(this.FunctionCall);
            this.CONSUME(SEMICOLON);
          }
        },
        { ALT: () => this.SUBRULE(this.IfStatement) },
        { ALT: () => this.SUBRULE(this.ForStatement) }
      ])
    );
  });

  /**
   * Level 4
   */

  protected Parameter = this.RULE("Parameter", () => {
    this.SUBRULE(this.Variable);
    this.OPTION(() => {
      this.SUBRULE(this.TypeDeclare);
    });
  });

  protected TypeDeclare = this.RULE("TypeDeclare", () => {
    this.CONSUME(AS);
    this.SUBRULE(this.TypeAnnotation);
  });

  /**
   * Level 5
   */

  protected Variable = this.RULE("Variable", () => {
    this.CONSUME(IDENTIFIER);
  });

  protected Number = this.RULE("Number", () => {
    this.OR([
      { ALT: () => this.CONSUME(FLOAT_VALUE) },
      { ALT: () => this.CONSUME(INT_VALUE) }
    ]);
  });

  protected ReturnStatement = this.RULE("ReturnStatement", () => {
    this.CONSUME(RETURN);
    this.SUBRULE(this.ValidVariable);
    this.CONSUME(SEMICOLON);
  });

  protected AssignStatement = this.RULE("AssignStatement", () => {
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(STATIC) },
        { ALT: () => this.CONSUME(GLOBAL_ZS) }
      ]);
    });
    this.OPTION1(() => {
      this.OR2([
        { ALT: () => this.CONSUME(VAR) },
        { ALT: () => this.CONSUME(VAL) }
      ]);
    });
    this.SUBRULE(this.FieldReference);
    this.OPTION2(() => {
      this.SUBRULE(this.TypeDeclare);
    });
    this.OPTION3(() => {
      this.CONSUME(ASSIGN);
      this.SUBRULE(this.ValidVariable);
    });
    this.CONSUME(SEMICOLON);
  });

  // This todo exists in the original bnf file.
  // In order not to highlight it, I used lowercase
  // Todo: check unary ! in the front
  protected IfStatement = this.RULE("IfStatement", () => {
    this.CONSUME(IF);
    this.OPTION(() => {
      this.SUBRULE(this.UnaryMathSigns);
    });
    this.CONSUME(BR_OPEN);
    this.AT_LEAST_ONE_SEP({
      SEP: () => {
        this.OR([
          { ALT: () => this.CONSUME(OR) },
          { ALT: () => this.CONSUME(AND) },
          { ALT: () => this.CONSUME(XOR) }
        ]);
      },
      DEF: () => {
        this.SUBRULE(this.Condition);
      }
    });
    this.CONSUME(BR_CLOSE);
    this.OR2([
      {
        ALT: () => this.SUBRULE(this.StatementBody)
      },
      { ALT: () => this.SUBRULE(this.Statement) }
    ]);
    this.OPTION2(() => {
      this.CONSUME(ELSE);
      this.OR3([
        {
          ALT: () => this.SUBRULE2(this.StatementBody)
        },
        { ALT: () => this.SUBRULE2(this.Statement) }
      ]);
    });
  });

  protected ForStatement = this.RULE("ForStatement", () => {
    this.CONSUME(FOR);
    this.SUBRULE(this.Variable);
    this.OR([
      {
        ALT: () => {
          this.CONSUME(IN);
          this.CONSUME(INT_VALUE, { LABEL: "init" });
          this.CONSUME(DOT2);
          this.CONSUME2(INT_VALUE, { LABEL: "end" });
        }
      },
      {
        ALT: () => {
          this.OPTION(() => {
            this.CONSUME(COMMA);
            this.SUBRULE3(this.Variable);
          });
          this.CONSUME2(IN);
          this.SUBRULE(this.ValidVariable);
        }
      }
    ]);
    this.SUBRULE(this.StatementBody);
  });

  protected Condition = this.RULE("Condition", () => {
    this.OPTION(() => {
      this.SUBRULE(this.UnaryMathSigns);
    });
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.ValidVariable);
          this.CONSUME(IN);
          this.SUBRULE2(this.ValidVariable);
        }
      },
      {
        ALT: () =>
          this.AT_LEAST_ONE_SEP({
            SEP: () =>
              this.OR2([
                { ALT: () => this.CONSUME(EQ) },
                {
                  ALT: () => this.CONSUME(NOT_EQ)
                },
                {
                  ALT: () => this.CONSUME(GTEQ)
                },
                {
                  ALT: () => this.CONSUME(LTEQ)
                },
                {
                  ALT: () => this.CONSUME(LT)
                },
                {
                  ALT: () => this.CONSUME(GT)
                }
              ]),
            DEF: () => {
              this.SUBRULE3(this.ValidVariable);
            }
          })
      }
    ]);
  });

  protected FunctionCall = this.RULE("FunctionCall", () => {
    this.SUBRULE(this.ValidCallable);
    this.AT_LEAST_ONE(() => {
      this.MANY(() => {
        this.CONSUME(DOT);
        this.CONSUME(IDENTIFIER);
      });

      this.CONSUME(BR_OPEN);
      this.MANY_SEP({
        SEP: COMMA,
        DEF: () => this.SUBRULE(this.ValidVariable)
      });
      this.CONSUME(BR_CLOSE);
    });
  });

  protected TypeAnnotation = this.RULE("TypeAnnotation", () => {
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
      { ALT: () => this.CONSUME(IDENTIFIER) }
    ]);
  });

  protected ValidVariable = this.RULE("ValidVariable", () => {
    this.OR([
      // {
      //   ALT: () => this.SUBRULE(this.FunctionDeclaration)
      // },
      { ALT: () => this.SUBRULE(this.ModuloType) },
      {
        ALT: () => this.SUBRULE(this.ArrayMapRead)
      },
      {
        ALT: () => this.SUBRULE(this.CastExpression)
      },
      { ALT: () => this.SUBRULE(this.Equation) },
      {
        ALT: () => this.SUBRULE(this.FunctionCall)
      },
      {
        ALT: () => this.SUBRULE(this.FieldReference)
      },
      {
        ALT: () => this.SUBRULE(this.BracketHandler)
      },
      { ALT: () => this.SUBRULE(this.Variable) },
      { ALT: () => this.SUBRULE(this.Number) },
      { ALT: () => this.CONSUME(NULL) },
      {
        ALT: () => this.CONSUME(DOUBLE_QUOTED_STRING)
      },
      {
        ALT: () => this.CONSUME(SINGLE_QUOTED_STRING)
      },
      {
        ALT: () => this.SUBRULE(this.ArrayDeclaration)
      },
      { ALT: () => this.CONSUME(TRUE) },
      { ALT: () => this.CONSUME(FALSE) },
      {
        ALT: () => this.SUBRULE(this.MapDeclaration)
      }
    ]);
  });

  protected ValidCallable = this.RULE("ValidCallable", () => {
    this.OR2([
      {
        ALT: () => this.SUBRULE(this.Variable)
      },
      {
        ALT: () => this.SUBRULE(this.BracketHandler)
      },
      { ALT: () => this.CONSUME(DOUBLE_QUOTED_STRING) },
      { ALT: () => this.CONSUME(SINGLE_QUOTED_STRING) },
      {
        ALT: () => this.SUBRULE(this.ArrayMapRead)
      },
      {
        ALT: () => {
          this.CONSUME(BR_OPEN);
          this.SUBRULE(this.ValidVariable);
          this.CONSUME(BR_CLOSE);
        }
      }
    ]);
  });

  private BracketKeywords = this.RULE("BracketKeywords", () => {
    this.OR([
      { ALT: () => this.CONSUME(IDENTIFIER) },
      { ALT: () => this.CONSUME(FLOAT_VALUE) },
      { ALT: () => this.CONSUME(INT_VALUE) },
      { ALT: () => this.CONSUME(BR_OPEN) },
      { ALT: () => this.CONSUME(BR_CLOSE) },
      {
        ALT: () => this.CONSUME(SQBR_OPEN)
      },
      {
        ALT: () => this.CONSUME(SQBR_CLOSE)
      },
      { ALT: () => this.CONSUME(A_OPEN) },
      { ALT: () => this.CONSUME(A_CLOSE) },
      { ALT: () => this.CONSUME(ASSIGN) },
      { ALT: () => this.CONSUME(NOT) },
      { ALT: () => this.CONSUME(TILDE) },
      { ALT: () => this.CONSUME(QUEST) },
      { ALT: () => this.CONSUME(COLON) },
      { ALT: () => this.CONSUME(PLUS) },
      { ALT: () => this.CONSUME(MINUS) },
      { ALT: () => this.CONSUME(MUL) },
      { ALT: () => this.CONSUME(DIV) },
      { ALT: () => this.CONSUME(OR) },
      { ALT: () => this.CONSUME(AND) },
      { ALT: () => this.CONSUME(XOR) },
      { ALT: () => this.CONSUME(MOD) },
      { ALT: () => this.CONSUME(SEMICOLON) },
      { ALT: () => this.CONSUME(COMMA) },
      { ALT: () => this.CONSUME(DOT) },
      { ALT: () => this.CONSUME(EQ) },
      { ALT: () => this.CONSUME(NOT_EQ) },
      { ALT: () => this.CONSUME(LTEQ) },
      { ALT: () => this.CONSUME(GTEQ) },
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
      { ALT: () => this.CONSUME(IMPORT) },
      { ALT: () => this.CONSUME(VAR) },
      { ALT: () => this.CONSUME(VAL) },
      { ALT: () => this.CONSUME(STATIC) },
      { ALT: () => this.CONSUME(GLOBAL_ZS) },
      { ALT: () => this.CONSUME(NULL) },
      { ALT: () => this.CONSUME(TRUE) },
      { ALT: () => this.CONSUME(FALSE) }
    ]);
  });

  /**
   * Format like <xxx>
   */
  protected BracketHandler = this.RULE("BracketHandler", () => {
    this.CONSUME(LT);
    this.MANY(() => {
      this.SUBRULE(this.BracketKeywords);
    });
    this.CONSUME(GT);
  });

  protected MapDeclaration = this.RULE("MapDeclaration", () => {
    this.CONSUME(A_OPEN);
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => {
        this.SUBRULE(this.MapEntry);
      }
    });
    this.CONSUME(A_CLOSE);
    this.OPTION(() => {
      this.SUBRULE(this.TypeDeclare);
    });
  });

  protected MapEntry = this.RULE("MapEntry", () => {
    this.SUBRULE(this.ValidVariable);
    this.CONSUME(COLON);
    this.SUBRULE2(this.ValidVariable);
  });

  protected ArrayDeclaration = this.RULE("ArrayDeclaration", () => {
    this.CONSUME(SQBR_OPEN);
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => {
        this.SUBRULE(this.ValidVariable);
      }
    });
    this.CONSUME(SQBR_CLOSE);
  });

  protected ArrayMapRead = this.RULE("ArrayMapRead", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: DOT,
      DEF: () => {
        this.CONSUME(IDENTIFIER);
      }
    });
    this.AT_LEAST_ONE(() => {
      this.CONSUME(SQBR_OPEN);
      this.SUBRULE(this.ValidVariable);
      this.CONSUME(SQBR_CLOSE);
    });
  });

  protected FieldReference = this.RULE("FieldReference", () => {
    this.SUBRULE(this.ValidCallable);
    this.MANY(() => {
      this.CONSUME(DOT);
      this.CONSUME(IDENTIFIER);
    });
  });

  protected CastExpression = this.RULE("CastExpression", () => {
    this.OR2([
      {
        ALT: () => this.SUBRULE(this.ArrayDeclaration)
      },
      {
        ALT: () => this.SUBRULE(this.FunctionCall)
      },
      {
        ALT: () => this.SUBRULE(this.FieldReference)
      },
      { ALT: () => this.SUBRULE(this.Number) },
      {
        ALT: () => this.SUBRULE(this.ValidCallable)
      }
    ]);
    this.SUBRULE(this.TypeDeclare);
  });

  protected ModuloType = this.RULE("ModuloType", () => {
    this.OR([
      { ALT: this.SUBRULE(this.BracketHandler) },
      { ALT: this.SUBRULE(this.Variable) }
    ]);
    this.CONSUME(MOD);
    this.CONSUME(INT_VALUE);
  });

  // This todo exists in the original bnf file.
  // In order not to highlight it, I used lowercase
  //Todo: possibly replace with external code, does not support brackets this way
  protected Equation = this.RULE("Equation", () => {
    this.OPTION(() => {
      this.SUBRULE(this.UnaryMathSigns);
    });
    this.SUBRULE(this.ValidCalculationVariable);
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.BinaryMathSigns);
      this.OPTION2(() => {
        this.SUBRULE2(this.UnaryMathSigns);
      });
      this.SUBRULE2(this.ValidCalculationVariable);
    });
  });

  private ValidCalculationVariable = this.RULE(
    "ValidCalculationVariable",
    () => {
      this.OR([
        {
          ALT: () => this.SUBRULE(this.BracketHandler)
        },
        {
          ALT: () => this.SUBRULE(this.FunctionCall)
        },
        {
          ALT: () => this.SUBRULE(this.FieldReference)
        },
        {
          ALT: () => this.SUBRULE(this.Number)
        },
        {
          ALT: () => this.SUBRULE(this.ArrayMapRead)
        },
        {
          ALT: () => this.SUBRULE(this.Variable)
        },
        {
          ALT: () => this.CONSUME(SINGLE_QUOTED_STRING)
        },
        {
          ALT: () => this.CONSUME(DOUBLE_QUOTED_STRING)
        }
      ]);
    }
  );

  private BinaryMathSigns = this.RULE("BinaryMathSigns", () =>
    this.OR([
      { ALT: () => this.CONSUME(PLUS) },
      { ALT: () => this.CONSUME(MINUS) },
      { ALT: () => this.CONSUME(MUL) },
      { ALT: () => this.CONSUME(DIV) }
    ])
  );

  private UnaryMathSigns = this.RULE("UnaryMathSigns", () => {
    this.CONSUME(NOT);
  });
}
