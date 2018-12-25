// Translated from https://github.com/CraftTweaker/ZenScriptIntelliJPlugin/blob/master/src/de/bloodworkxgaming/zenscript/plugin/zsLanguage/psi/ZenScript.bnf

import { Parser } from "chevrotain";
import {
  zsAllTokens,
  PREPROCESSOR,
  IMPORT,
  IDENTIFIER,
  DOT,
  AS,
  SEMICOLON,
  EOL,
  STATIC,
  GLOBAL_ZS,
  VAR,
  VAL,
  DOUBLE_QUOTED_STRING,
  SINGLE_QUOTED_STRING,
  L_ROUND_BRACKET,
  R_ROUND_BRACKET,
  NULL,
  TRUE,
  FALSE,
  PERC,
  DIGITS,
  FLOATING_POINT,
  EXP_NUMBER,
  BOOL,
  BYTE,
  SHORT,
  INT,
  LONG,
  FLOAT,
  DOUBLE,
  STRING,
  L_SQUARE_BRACKET,
  R_SQUARE_BRACKET,
  L_ANGLE_BRACKET,
  R_ANGLE_BRACKET,
  L_CURLY_BRACKET,
  R_CURLY_BRACKET,
  TILDE,
  EQUAL,
  EXCL,
  QUEST,
  COLON,
  PLUS,
  MINUS,
  ASTERISK,
  DIV,
  OR,
  AND,
  XOR,
  HASH,
  AT,
  EQEQ,
  COMMA,
  ANY,
  NOT_EQUAL,
  LESS_EQUAL,
  GREATER_EQUAL,
  VERSION,
  VOID,
  TO,
  IN,
  FUNCTION,
  RETURN,
  IF,
  ELSE,
  FOR,
  DOTDOT
} from "./zsLexer";

export class ZenScriptParser extends Parser {
  zsFile;
  preprocessor_list;
  import_list;
  import_statement;
  statement;
  bracket_keywords;
  bracketHandler;
  variable;
  class_name;
  number;
  validCallable;
  validVariable;
  field_reference;
  moduloType;
  assignStatement;
  map_declaration;
  map_entry;
  functionCall;
  arrayDeclaration;
  arrayMapRead;
  castExpression;
  statement_body;
  return_statement;
  for_loop;
  condition;
  if_statement;
  function_declaration;
  lambda_function_declaration;
  parameter_list;
  parameter_variable;
  function_body;
  equation;
  valid_calculation_variable;
  binary_math_signs;
  unary_math_signs;

  constructor() {
    super(zsAllTokens);
    const $ = this;

    $.RULE("zsFile", () => {
      $.SUBRULE($.preprocessor_list);
      $.SUBRULE($.import_list);
      // $.MANY(() => {
      //   $.OR([
      //     {
      //       ALT: () => $.SUBRULE($.statement)
      //     },
      //     {
      //       ALT: () => $.SUBRULE($.function_declaration)
      //     }
      //   ]);
      // });
    });

    $.RULE("preprocessor_list", () => {
      $.MANY(() => {
        $.CONSUME(PREPROCESSOR);
      });
    });

    $.RULE("import_list", () => {
      $.MANY(() => {
        $.SUBRULE($.import_statement);
      });
    });

    $.RULE("import_statement", () => {
      $.CONSUME(IMPORT);
      $.CONSUME(IDENTIFIER);
      $.MANY(() => {
        $.CONSUME(DOT);
        $.CONSUME2(IDENTIFIER);
      });
      $.OPTION(() => {
        $.CONSUME(AS);
        $.CONSUME3(IDENTIFIER);
      });
      $.CONSUME(SEMICOLON);
    });

    $.RULE("statement", () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.assignStatement);
            $.CONSUME(SEMICOLON);
          }
        },
        { ALT: () => $.CONSUME(EOL) },
        {
          ALT: () => {
            $.SUBRULE($.functionCall);
            $.CONSUME2(SEMICOLON);
          }
        },
        { ALT: () => $.SUBRULE($.for_loop) },
        { ALT: () => $.SUBRULE($.if_statement) }
      ]);
    });

    /**
     * Assignment Statement
     */
    $.RULE("bracket_keywords", () => {
      $.OR([
        { ALT: () => $.CONSUME(IDENTIFIER) },
        { ALT: () => $.CONSUME(DIGITS) },
        { ALT: () => $.CONSUME(FLOATING_POINT) },
        { ALT: () => $.CONSUME(EXP_NUMBER) },
        { ALT: () => $.CONSUME(L_ROUND_BRACKET) },
        { ALT: () => $.CONSUME(R_ROUND_BRACKET) },
        {
          ALT: () => $.CONSUME(L_SQUARE_BRACKET)
        },
        {
          ALT: () => $.CONSUME(R_SQUARE_BRACKET)
        },
        { ALT: () => $.CONSUME(L_CURLY_BRACKET) },
        { ALT: () => $.CONSUME(R_CURLY_BRACKET) },
        { ALT: () => $.CONSUME(EQUAL) },
        { ALT: () => $.CONSUME(EXCL) },
        { ALT: () => $.CONSUME(TILDE) },
        { ALT: () => $.CONSUME(QUEST) },
        { ALT: () => $.CONSUME(COLON) },
        { ALT: () => $.CONSUME(PLUS) },
        { ALT: () => $.CONSUME(MINUS) },
        { ALT: () => $.CONSUME(ASTERISK) },
        { ALT: () => $.CONSUME(DIV) },
        { ALT: () => $.CONSUME(OR) },
        { ALT: () => $.CONSUME(AND) },
        { ALT: () => $.CONSUME(XOR) },
        { ALT: () => $.CONSUME(PERC) },
        { ALT: () => $.CONSUME(AT) },
        { ALT: () => $.CONSUME(HASH) },
        { ALT: () => $.CONSUME(SEMICOLON) },
        { ALT: () => $.CONSUME(COMMA) },
        { ALT: () => $.CONSUME(DOT) },
        { ALT: () => $.CONSUME(EQEQ) },
        { ALT: () => $.CONSUME(NOT_EQUAL) },
        { ALT: () => $.CONSUME(LESS_EQUAL) },
        { ALT: () => $.CONSUME(GREATER_EQUAL) },
        { ALT: () => $.CONSUME(ANY) },
        { ALT: () => $.CONSUME(BOOL) },
        { ALT: () => $.CONSUME(BYTE) },
        { ALT: () => $.CONSUME(SHORT) },
        { ALT: () => $.CONSUME(INT) },
        { ALT: () => $.CONSUME(LONG) },
        { ALT: () => $.CONSUME(FLOAT) },
        { ALT: () => $.CONSUME(DOUBLE) },
        { ALT: () => $.CONSUME(STRING) },
        { ALT: () => $.CONSUME(FUNCTION) },
        { ALT: () => $.CONSUME(IN) },
        { ALT: () => $.CONSUME(TO) },
        { ALT: () => $.CONSUME(VOID) },
        { ALT: () => $.CONSUME(AS) },
        { ALT: () => $.CONSUME(VERSION) },
        { ALT: () => $.CONSUME(IF) },
        { ALT: () => $.CONSUME(ELSE) },
        { ALT: () => $.CONSUME(FOR) },
        { ALT: () => $.CONSUME(RETURN) },
        { ALT: () => $.CONSUME(IMPORT) },
        { ALT: () => $.CONSUME(VAR) },
        { ALT: () => $.CONSUME(VAL) },
        { ALT: () => $.CONSUME(STATIC) },
        { ALT: () => $.CONSUME(GLOBAL_ZS) },
        { ALT: () => $.CONSUME(NULL) },
        { ALT: () => $.CONSUME(TRUE) },
        { ALT: () => $.CONSUME(FALSE) }
      ]);
    });

    $.RULE("bracketHandler", () => {
      $.CONSUME(L_ANGLE_BRACKET);
      $.MANY(() => $.SUBRULE($.bracket_keywords));
      $.CONSUME(R_ANGLE_BRACKET);
    });

    $.RULE("variable", () => $.CONSUME(IDENTIFIER));

    $.RULE("class_name", () => {
      $.OR([
        { ALT: () => $.CONSUME(BOOL) },
        { ALT: () => $.CONSUME(BYTE) },
        { ALT: () => $.CONSUME(SHORT) },
        { ALT: () => $.CONSUME(INT) },
        { ALT: () => $.CONSUME(LONG) },
        { ALT: () => $.CONSUME(FLOAT) },
        { ALT: () => $.CONSUME(DOUBLE) },
        { ALT: () => $.CONSUME(STRING) },
        { ALT: () => $.CONSUME(IDENTIFIER) }
      ]);
      $.MANY(() => {
        $.CONSUME(L_SQUARE_BRACKET);
        $.OPTION($.SUBRULE($.class_name));
        $.CONSUME(R_SQUARE_BRACKET);
      });
    });

    $.RULE("number", () => {
      $.OR([
        { ALT: () => $.CONSUME(DIGITS) },
        { ALT: () => $.CONSUME(FLOATING_POINT) },
        { ALT: () => $.CONSUME(EXP_NUMBER) }
      ]);
    });

    $.RULE("validCallable", () => {
      $.OR([
        {
          ALT: () => $.SUBRULE($.bracketHandler)
        },
        { ALT: () => $.SUBRULE($.variable) },
        {
          ALT: () => $.CONSUME(DOUBLE_QUOTED_STRING)
        },
        {
          ALT: () => $.CONSUME(SINGLE_QUOTED_STRING)
        },
        {
          ALT: () => $.SUBRULE($.arrayMapRead)
        },
        {
          ALT: () => {
            $.CONSUME(L_ROUND_BRACKET);
            $.SUBRULE($.validVariable);
            $.CONSUME(R_ROUND_BRACKET);
          }
        }
      ]);
    });

    $.RULE("validVariable", () => {
      $.OR([
        {
          ALT: () => $.SUBRULE($.lambda_function_declaration)
        },
        { ALT: () => $.SUBRULE($.moduloType) },
        {
          ALT: () => $.SUBRULE($.arrayMapRead)
        },
        {
          ALT: () => $.SUBRULE($.castExpression)
        },
        { ALT: () => $.SUBRULE($.equation) },
        {
          ALT: () => $.SUBRULE($.functionCall)
        },
        {
          ALT: () => $.SUBRULE($.field_reference)
        },
        {
          ALT: () => $.SUBRULE($.bracketHandler)
        },
        { ALT: () => $.SUBRULE($.variable) },
        { ALT: () => $.SUBRULE($.number) },
        { ALT: () => $.CONSUME(NULL) },
        {
          ALT: () => $.CONSUME(DOUBLE_QUOTED_STRING)
        },
        {
          ALT: () => $.CONSUME(SINGLE_QUOTED_STRING)
        },
        {
          ALT: () => $.SUBRULE($.arrayDeclaration)
        },
        { ALT: () => $.CONSUME(TRUE) },
        { ALT: () => $.CONSUME(FALSE) },
        {
          ALT: () => $.SUBRULE($.map_declaration)
        }
      ]);
    });

    $.RULE("field_reference", () => {
      $.SUBRULE($.validCallable);
      $.MANY(() => {
        $.CONSUME(DOT);
        $.CONSUME(IDENTIFIER);
      });
    });

    $.RULE("moduloType", () => {
      $.OR([
        { ALT: $.SUBRULE($.bracketHandler) },
        { ALT: $.SUBRULE($.variable) }
      ]);
      $.CONSUME(PERC);
      $.CONSUME(DIGITS);
    });

    $.RULE("assignStatement", () => {
      $.OPTION(() => {
        $.OR([
          { ALT: () => $.CONSUME(STATIC) },
          { ALT: () => $.CONSUME(GLOBAL_ZS) }
        ]);
        $.OR2([{ ALT: () => $.CONSUME(VAR) }, { ALT: () => $.CONSUME(VAL) }]);
        $.SUBRULE($.field_reference);
      });
    });

    $.RULE("map_declaration", () => {
      $.CONSUME(L_CURLY_BRACKET);
      $.MANY(() => {
        $.SUBRULE($.map_entry);
        $.CONSUME(COMMA);
      });
      $.OPTION($.SUBRULE2($.map_entry));
      $.CONSUME(R_CURLY_BRACKET);
      $.OPTION2(() => {
        $.CONSUME(AS);
        $.SUBRULE($.class_name);
      });
    });

    $.RULE("map_entry", () => {
      $.SUBRULE($.validVariable);
      $.CONSUME(COLON);
      $.SUBRULE2($.validVariable);
    });

    $.RULE("functionCall", () => {
      $.SUBRULE($.validCallable);
      $.AT_LEAST_ONE(() => {
        $.MANY(() => {
          $.CONSUME(DOT);
          $.CONSUME(IDENTIFIER);
        });
        $.OR([
          {
            ALT: () => {
              $.CONSUME(L_ROUND_BRACKET);
              $.CONSUME(R_ROUND_BRACKET);
            }
          },
          {
            ALT: () => {
              $.CONSUME2(L_ROUND_BRACKET);
              $.SUBRULE($.validVariable);
              $.MANY2(() => {
                $.CONSUME(COMMA);
                $.SUBRULE2($.validVariable);
              });
              $.CONSUME2(R_ROUND_BRACKET);
            }
          }
        ]);
      });
    });

    $.RULE("arrayDeclaration", () => {
      $.CONSUME(L_SQUARE_BRACKET);
      $.OPTION(() => {
        $.SUBRULE($.validVariable);
        $.MANY(() => {
          $.CONSUME(COMMA);
          $.SUBRULE2($.validVariable);
        });
        $.OPTION2(() => $.CONSUME2(COMMA));
      });
      $.CONSUME(R_SQUARE_BRACKET);
    });

    $.RULE("arrayMapRead", () => {
      $.CONSUME(IDENTIFIER);
      $.MANY(() => {
        $.CONSUME(DOT);
        $.CONSUME2(IDENTIFIER);
      });
      $.AT_LEAST_ONE(() => {
        $.CONSUME(L_SQUARE_BRACKET);
        $.SUBRULE($.validVariable);
        $.CONSUME(R_SQUARE_BRACKET);
      });
    });

    $.RULE("castExpression", () => {
      $.OR([
        {
          ALT: () => $.SUBRULE($.arrayDeclaration)
        },
        {
          ALT: () => $.SUBRULE($.functionCall)
        },
        {
          ALT: () => $.SUBRULE($.field_reference)
        },
        { ALT: () => $.SUBRULE($.number) },
        {
          ALT: () => $.SUBRULE($.validCallable)
        }
      ]);
      $.CONSUME(AS);
      $.SUBRULE($.class_name);
    });

    // CONTROL STATEMENTS
    $.RULE("statement_body", () => {
      $.OR([
        {
          ALT: () => {
            $.CONSUME(L_CURLY_BRACKET);
            $.MANY($.SUBRULE($.statement));
            $.CONSUME(R_CURLY_BRACKET);
          }
        },
        { ALT: () => $.SUBRULE($.function_body) }
      ]);
    });

    $.RULE("return_statement", () => {
      $.CONSUME(RETURN);
      $.SUBRULE($.validVariable);
      $.CONSUME(SEMICOLON);
    });

    $.RULE("for_loop", () => {
      $.CONSUME(FOR);
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.variable);
            $.CONSUME(IN);
            $.CONSUME(DIGITS);
            $.OR2([
              { ALT: () => $.CONSUME(DOTDOT) },
              { ALT: () => $.CONSUME(TO) }
            ]);
            $.CONSUME2(DIGITS);
          }
        },
        {
          ALT: () => {
            $.OPTION(() => {
              $.SUBRULE2($.variable);
              $.CONSUME(COMMA);
            });
            $.SUBRULE3($.variable);
            $.CONSUME2(IN);
            $.SUBRULE($.validVariable);
          }
        }
      ]);
      $.SUBRULE($.statement_body);
    });

    $.RULE("condition", () => {
      $.OPTION($.SUBRULE($.unary_math_signs));
      $.SUBRULE($.validVariable);
      $.OR([
        {
          ALT: () => {
            $.CONSUME(IN);
            $.SUBRULE2($.validVariable);
          }
        },
        {
          ALT: () =>
            $.MANY(() => {
              $.OR2([
                { ALT: () => $.CONSUME(EQEQ) },
                {
                  ALT: () => $.CONSUME(NOT_EQUAL)
                },
                {
                  ALT: () => $.CONSUME(GREATER_EQUAL)
                },
                {
                  ALT: () => $.CONSUME(LESS_EQUAL)
                },
                {
                  ALT: () => $.CONSUME(L_ANGLE_BRACKET)
                },
                {
                  ALT: () => $.CONSUME(R_ANGLE_BRACKET)
                }
              ]);
              $.SUBRULE3($.validVariable);
            })
        }
      ]);
    });

    // This todo exists in the original bnf file.
    // In order not to highlight it, I used lowercase
    // Todo: check unary ! in the front
    $.RULE("if_statement", () => {
      $.CONSUME(IF);
      $.OPTION($.SUBRULE($.unary_math_signs));
      $.CONSUME(L_ROUND_BRACKET);
      $.SUBRULE($.condition);
      $.MANY(() => {
        $.OR([
          { ALT: () => $.CONSUME(OR) },
          { ALT: () => $.CONSUME(AND) },
          { ALT: () => $.CONSUME(XOR) }
        ]);
        $.SUBRULE2($.condition);
      });
      $.CONSUME(R_ROUND_BRACKET);
      $.OR2([
        {
          ALT: () => $.SUBRULE($.statement_body)
        },
        { ALT: () => $.SUBRULE($.statement) }
      ]);
      $.OPTION2(() => {
        $.CONSUME(ELSE);
        $.OR3([
          {
            ALT: () => $.SUBRULE2($.statement_body)
          },
          { ALT: () => $.SUBRULE2($.statement) }
        ]);
      });
    });

    $.RULE("function_declaration", () => {
      $.CONSUME(FUNCTION);
      $.CONSUME(IDENTIFIER);
      $.CONSUME(L_ROUND_BRACKET);
      $.OPTION(() => $.SUBRULE($.parameter_list));
      $.CONSUME(R_ROUND_BRACKET);
      $.OPTION2(() => {
        $.CONSUME(AS);
        $.SUBRULE($.class_name);
      });
      $.SUBRULE($.function_body);
    });

    $.RULE("lambda_function_declaration", () => {
      $.CONSUME(FUNCTION);
      $.CONSUME(L_ROUND_BRACKET);
      $.OPTION($.SUBRULE($.parameter_list));
      $.CONSUME(R_ROUND_BRACKET);
      $.OPTION2(() => {
        $.CONSUME(AS);
        $.SUBRULE($.class_name);
      });
      $.SUBRULE($.function_body);
    });

    $.RULE("parameter_list", () => {
      $.MANY(() => {
        $.SUBRULE($.parameter_variable);
        $.CONSUME(COMMA);
      });
      $.SUBRULE2($.parameter_variable);
    });

    $.RULE("parameter_variable", () => {
      $.SUBRULE($.variable);
      $.OPTION(() => {
        $.CONSUME(AS);
        $.SUBRULE($.class_name);
      });
    });

    $.RULE("function_body", () => {
      $.CONSUME(L_CURLY_BRACKET);
      $.MANY($.SUBRULE($.statement));
      $.OPTION(() => $.SUBRULE($.return_statement));
      $.CONSUME(R_CURLY_BRACKET);
    });

    // This todo exists in the original bnf file.
    // In order not to highlight it, I used lowercase
    //Todo: possibly replace with external code, does not support brackets this way
    $.RULE("equation", () => {
      $.OPTION($.SUBRULE($.unary_math_signs));
      $.SUBRULE($.valid_calculation_variable);
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.binary_math_signs);
        $.OPTION2($.SUBRULE2($.unary_math_signs));
        $.SUBRULE2($.valid_calculation_variable);
      });
    });

    $.RULE("valid_calculation_variable", () => {
      $.SUBRULE($.bracketHandler);
      $.SUBRULE($.functionCall);
      $.SUBRULE($.field_reference);
      $.SUBRULE($.number);
      $.SUBRULE($.arrayMapRead);
      $.SUBRULE($.variable);
      $.CONSUME(SINGLE_QUOTED_STRING);
      $.CONSUME(DOUBLE_QUOTED_STRING);
    });

    $.RULE("binary_math_signs", () =>
      $.OR([
        { ALT: () => $.CONSUME(PLUS) },
        { ALT: () => $.CONSUME(MINUS) },
        { ALT: () => $.CONSUME(ASTERISK) },
        { ALT: () => $.CONSUME(DIV) }
      ])
    );

    $.RULE("unary_math_signs", () => {
      $.CONSUME(EXCL);
    });

    // this.performSelfAnalysis();
  }
}
