// Translated from https://github.com/CraftTweaker/ZenScriptIntelliJPlugin/blob/master/src/de/bloodworkxgaming/zenscript/plugin/zsLanguage/psi/ZenScript.bnf

import { IToken, Parser } from "chevrotain";
import {
  AND,
  ANY,
  AS,
  ASTERISK,
  AT,
  BOOL,
  BYTE,
  COLON,
  COMMA,
  DIGITS,
  DIV,
  DOT,
  DOTDOT,
  DOUBLE,
  DOUBLE_QUOTED_STRING,
  ELSE,
  EQEQ,
  EQUAL,
  EXCL,
  EXP_NUMBER,
  FALSE,
  FLOAT,
  FLOATING_POINT,
  FOR,
  FUNCTION,
  GLOBAL_ZS,
  GREATER_EQUAL,
  HASH,
  IDENTIFIER,
  IF,
  IMPORT,
  IN,
  INT,
  LESS_EQUAL,
  LONG,
  L_ANGLE_BRACKET,
  L_CURLY_BRACKET,
  L_ROUND_BRACKET,
  L_SQUARE_BRACKET,
  MINUS,
  NOT_EQUAL,
  NULL,
  OR,
  PERC,
  PLUS,
  PREPROCESSOR,
  QUEST,
  RETURN,
  R_ANGLE_BRACKET,
  R_CURLY_BRACKET,
  R_ROUND_BRACKET,
  R_SQUARE_BRACKET,
  SEMICOLON,
  SHORT,
  SINGLE_QUOTED_STRING,
  STATIC,
  STRING,
  TILDE,
  TO,
  TRUE,
  VAL,
  VAR,
  VERSION,
  VOID,
  XOR,
  zsAllTokens
} from "./zsLexer";

const body = { LABEL: "body" };
const Declaration = { LABEL: "Declaration" };

export class ZenScriptParser extends Parser {
  public Program = this.RULE("Program", () => {
    this.SUBRULE(this.ProcessorList);
    this.SUBRULE(this.ImportList);

    this.MANY(() =>
      this.OR([
        { ALT: () => this.SUBRULE(this.FunctionDeclaration, Declaration) },
        { ALT: () => this.SUBRULE(this.BlockStatement, Declaration) }
      ])
    );
  });

  // identifier.identifier
  protected Package = this.RULE("Package", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: COMMA,
      DEF: () => {
        this.CONSUME(IDENTIFIER);
      }
    });
  });

  protected Variable = this.RULE("Variable", () => {
    this.CONSUME(IDENTIFIER);
  });

  protected Number = this.RULE("Number", () => {
    this.OR([
      { ALT: () => this.CONSUME(DIGITS) },
      { ALT: () => this.CONSUME(FLOATING_POINT) },
      { ALT: () => this.CONSUME(EXP_NUMBER) }
    ]);
  });

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
        this.CONSUME2(IDENTIFIER);
      });
      this.CONSUME(SEMICOLON);
    });
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
      this.CONSUME(EQUAL);
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
    this.CONSUME(L_ROUND_BRACKET);
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
    this.CONSUME(R_ROUND_BRACKET);
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
          this.CONSUME(DIGITS, { LABEL: "init" });
          this.OR2([
            { ALT: () => this.CONSUME(DOTDOT) },
            { ALT: () => this.CONSUME(TO) }
          ]);
          this.CONSUME2(DIGITS, { LABEL: "end" });
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
              this.OR([
                { ALT: () => this.CONSUME(EQEQ) },
                {
                  ALT: () => this.CONSUME(NOT_EQUAL)
                },
                {
                  ALT: () => this.CONSUME(GREATER_EQUAL)
                },
                {
                  ALT: () => this.CONSUME(LESS_EQUAL)
                },
                {
                  ALT: () => this.CONSUME(L_ANGLE_BRACKET)
                },
                {
                  ALT: () => this.CONSUME(R_ANGLE_BRACKET)
                }
              ]),
            DEF: () => {
              this.SUBRULE(this.ValidVariable);
            }
          })
      }
    ]);
  });

  protected StatementBody = this.RULE("StatementBody", () => {
    this.CONSUME(L_CURLY_BRACKET);
    this.SUBRULE(this.BlockStatement);
    this.CONSUME(R_CURLY_BRACKET);
  });

  protected FunctionDeclaration = this.RULE("FunctionDeclaration", lambda => {
    this.CONSUME(FUNCTION);
    this.OR([
      { GATE: () => lambda !== undefined, ALT: () => this.CONSUME(IDENTIFIER) }
    ]);
    this.SUBRULE(this.ParameterList);
    this.OPTION(() => {
      this.SUBRULE(this.TypeDeclare);
    });
    this.SUBRULE(this.StatementBody);
  });

  protected FunctionCall = this.RULE("FunctionCall", () => {
    this.SUBRULE(this.ValidCallable);
    this.AT_LEAST_ONE(() => {
      this.MANY(() => {
        this.CONSUME(DOT);
        this.CONSUME(IDENTIFIER);
      });

      this.CONSUME(L_ROUND_BRACKET);
      this.MANY_SEP({
        SEP: COMMA,
        DEF: () => this.SUBRULE(this.ValidVariable)
      });
      this.CONSUME(R_ROUND_BRACKET);
    });
  });

  protected ParameterList = this.RULE("ParameterList", () => {
    this.CONSUME(L_ROUND_BRACKET);
    this.MANY_SEP({
      SEP: COMMA,
      DEF() {
        this.SUBRULE(this.Parameter);
      }
    });
    this.CONSUME(R_ROUND_BRACKET);
  });

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

  protected BlockStatement = this.RULE("BlockStatement", () => {
    this.MANY(() => this.SUBRULE(this.Statement, body));
  });

  protected ValidVariable = this.RULE("ValidVariable", () => {
    this.OR([
      {
        ALT: () => this.SUBRULE(this.FunctionDeclaration, { ARGS: [true] })
      },
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
    this.OR([
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
          this.CONSUME(L_ROUND_BRACKET);
          this.SUBRULE(this.ValidVariable);
          this.CONSUME(R_ROUND_BRACKET);
        }
      }
    ]);
  });

  private BracketKeywords = this.RULE("BracketKeywords", () => {
    this.OR([
      { ALT: () => this.CONSUME(IDENTIFIER) },
      { ALT: () => this.CONSUME(DIGITS) },
      { ALT: () => this.CONSUME(FLOATING_POINT) },
      { ALT: () => this.CONSUME(EXP_NUMBER) },
      { ALT: () => this.CONSUME(L_ROUND_BRACKET) },
      { ALT: () => this.CONSUME(R_ROUND_BRACKET) },
      {
        ALT: () => this.CONSUME(L_SQUARE_BRACKET)
      },
      {
        ALT: () => this.CONSUME(R_SQUARE_BRACKET)
      },
      { ALT: () => this.CONSUME(L_CURLY_BRACKET) },
      { ALT: () => this.CONSUME(R_CURLY_BRACKET) },
      { ALT: () => this.CONSUME(EQUAL) },
      { ALT: () => this.CONSUME(EXCL) },
      { ALT: () => this.CONSUME(TILDE) },
      { ALT: () => this.CONSUME(QUEST) },
      { ALT: () => this.CONSUME(COLON) },
      { ALT: () => this.CONSUME(PLUS) },
      { ALT: () => this.CONSUME(MINUS) },
      { ALT: () => this.CONSUME(ASTERISK) },
      { ALT: () => this.CONSUME(DIV) },
      { ALT: () => this.CONSUME(OR) },
      { ALT: () => this.CONSUME(AND) },
      { ALT: () => this.CONSUME(XOR) },
      { ALT: () => this.CONSUME(PERC) },
      { ALT: () => this.CONSUME(AT) },
      { ALT: () => this.CONSUME(HASH) },
      { ALT: () => this.CONSUME(SEMICOLON) },
      { ALT: () => this.CONSUME(COMMA) },
      { ALT: () => this.CONSUME(DOT) },
      { ALT: () => this.CONSUME(EQEQ) },
      { ALT: () => this.CONSUME(NOT_EQUAL) },
      { ALT: () => this.CONSUME(LESS_EQUAL) },
      { ALT: () => this.CONSUME(GREATER_EQUAL) },
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
      { ALT: () => this.CONSUME(TO) },
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
    this.CONSUME(L_ANGLE_BRACKET);
    this.MANY(() => {
      this.SUBRULE(this.BracketKeywords);
    });
    this.CONSUME(R_ANGLE_BRACKET);
  });

  protected MapDeclaration = this.RULE("MapDeclaration", () => {
    this.CONSUME(L_CURLY_BRACKET);
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => {
        this.SUBRULE(this.MapEntry);
      }
    });
    this.CONSUME(R_CURLY_BRACKET);
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
    this.CONSUME(L_SQUARE_BRACKET);
    this.MANY_SEP({
      SEP: COMMA,
      DEF: () => {
        this.SUBRULE(this.ValidVariable);
      }
    });
    this.CONSUME(R_SQUARE_BRACKET);
  });

  protected ArrayMapRead = this.RULE("ArrayMapRead", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: DOT,
      DEF: () => {
        this.CONSUME(IDENTIFIER);
      }
    });
    this.AT_LEAST_ONE(() => {
      this.CONSUME(L_SQUARE_BRACKET);
      this.SUBRULE(this.ValidVariable);
      this.CONSUME(R_SQUARE_BRACKET);
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
    this.OR([
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
    this.CONSUME(PERC);
    this.CONSUME(DIGITS);
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
      this.SUBRULE(this.BracketHandler);
      this.SUBRULE(this.FunctionCall);
      this.SUBRULE(this.FieldReference);
      this.SUBRULE(this.Number);
      this.SUBRULE(this.ArrayMapRead);
      this.SUBRULE(this.Variable);
      this.CONSUME(SINGLE_QUOTED_STRING);
      this.CONSUME(DOUBLE_QUOTED_STRING);
    }
  );

  private BinaryMathSigns = this.RULE("BinaryMathSigns", () =>
    this.OR([
      { ALT: () => this.CONSUME(PLUS) },
      { ALT: () => this.CONSUME(MINUS) },
      { ALT: () => this.CONSUME(ASTERISK) },
      { ALT: () => this.CONSUME(DIV) }
    ])
  );

  private UnaryMathSigns = this.RULE("UnaryMathSigns", () => {
    this.CONSUME(EXCL);
  });

  constructor(input: IToken[]) {
    super(zsAllTokens, {});
    this.input = input;
    this.performSelfAnalysis();
  }
}
