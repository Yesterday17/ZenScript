import * as chevrotain from "chevrotain";

const createToken = chevrotain.createToken;

const EOL = createToken({
  name: "EOL",
  pattern: /\r/
});
const WHITE_SPACE = createToken({
  name: "WHITE_SPACE",
  pattern: /\s+/,
  group: chevrotain.Lexer.SKIPPED
});

const LINE_COMMENT = createToken({
  name: "LINE_COMMENT",
  pattern: /\/\/.*/
});
const BLOCK_COMMENT = createToken({
  name: "BLOCK_COMMENT",
  pattern: /\/\*([^*]|\*+[^*/])*(\*+\/)?/
});
const DOUBLE_QUOTED_STRING = createToken({
  name: "DOUBLE_QUOTED_STRING",
  pattern: /\"([^\\\"\r\n]|\\[^\r\n])*\"?/
});
const SINGLE_QUOTED_STRING = createToken({
  name: "SINGLE_QUOTED_STRING",
  pattern: /'([^\\'\r\n]|\\[^\r\n])*'?/
});
const PREPROCESSOR = createToken({
  name: "PREPROCESSOR",
  pattern: /#[^ \t\r\n\x0B\f\r].*/
});
const EXP_NUMBER = createToken({
  name: "EXP_NUMBER",
  pattern: "-?[0-9]+.[0-9]+[Ee]-?[0-9]+"
});
const DIGITS = createToken({
  name: "DIGITS",
  pattern: /-?[0-9]+/
});
const FLOATING_POINT = createToken({
  name: "FLOATING_POINT",
  pattern: /-?[0-9]+\.[0-9]+/
});
const IN = createToken({
  name: "IN",
  pattern: /in|has/
});
const IDENTIFIER = createToken({
  name: "IDENTIFIER",
  pattern: /[_a-zA-Z][_a-zA-Z0-9]*/
});

const L_ROUND_BRACKET = createToken({ name: "L_ROUND_BRACKET", pattern: /\(/ });
const R_ROUND_BRACKET = createToken({ name: "R_ROUND_BRACKET", pattern: /\)/ });
const L_ANGLE_BRACKET = createToken({ name: "L_ANGLE_BRACKET", pattern: /</ });
const R_ANGLE_BRACKET = createToken({ name: "R_ANGLE_BRACKET", pattern: />/ });
const L_SQUARE_BRACKET = createToken({
  name: "L_SQUARE_BRACKET",
  pattern: /\[/
});
const R_SQUARE_BRACKET = createToken({
  name: "R_SQUARE_BRACKET",
  pattern: /\]/
});
const L_CURLY_BRACKET = createToken({ name: "L_CURLY_BRACKET", pattern: /\{/ });
const R_CURLY_BRACKET = createToken({ name: "R_CURLY_BRACKET", pattern: /\}/ });
const EQUAL = createToken({ name: "EQUAL", pattern: /\=/ });
const EXCL = createToken({ name: "EXCL", pattern: /\!/ });
const TILDE = createToken({ name: "TILDE", pattern: /\~/ });
const QUEST = createToken({ name: "QUEST", pattern: /\?/ });
const COLON = createToken({ name: "COLON", pattern: /\:/ });
const PLUS = createToken({ name: "PLUS", pattern: /\+/ });
const MINUS = createToken({ name: "MINUS", pattern: /\-/ });
const ASTERISK = createToken({ name: "ASTERISK", pattern: /\*/ });
const DIV = createToken({ name: "DIV", pattern: /\// });
const OR = createToken({ name: "OR", pattern: /\|/ });
const AND = createToken({ name: "AND", pattern: /\&/ });
const XOR = createToken({ name: "XOR", pattern: /\^/ });
const PERC = createToken({ name: "PERC", pattern: /\%/ });
const AT = createToken({ name: "AT", pattern: /\@/ });
const HASH = createToken({ name: "HASH", pattern: /\#/ });
const SEMICOLON = createToken({ name: "SEMICOLON", pattern: /\;/ });
const COMMA = createToken({ name: "COMMA", pattern: /\,/ });
const DOT = createToken({ name: "DOT", pattern: /\./ });
const DOTDOT = createToken({ name: "DOTDOT", pattern: /\.\./ });
const EQEQ = createToken({ name: "L_ROUND_BRACKET", pattern: /\=\=/ });
const NOT_EQUAL = createToken({ name: "NOT_EQUAL", pattern: /\!\=/ });
const LESS_EQUAL = createToken({ name: "LESS_EQUAL", pattern: /\<\=/ });
const GREATER_EQUAL = createToken({ name: "GREATER_EQUAL", pattern: /\>\=/ });
const ANY = createToken({ name: "ANY", pattern: /any/ });
const BOOL = createToken({ name: "BOOL", pattern: /bool/ });
const BYTE = createToken({ name: "BYTE", pattern: /byte/ });
const SHORT = createToken({ name: "SHORT", pattern: /short/ });
const INT = createToken({ name: "INT", pattern: /int/ });
const LONG = createToken({ name: "LONG", pattern: /long/ });
const FLOAT = createToken({ name: "FLOAT", pattern: /float/ });
const DOUBLE = createToken({ name: "DOUBLE", pattern: /double/ });
const STRING = createToken({ name: "STRING", pattern: /string/ });
const FUNCTION = createToken({ name: "FUNCTION", pattern: /function/ });
const TO = createToken({ name: "TO", pattern: /to/ });
const VOID = createToken({ name: "VOID", pattern: /void/ });
const AS = createToken({ name: "AS", pattern: /as/ });
const VERSION = createToken({ name: "VERSION", pattern: /version/ });
const IF = createToken({ name: "IF", pattern: /if/ });
const ELSE = createToken({ name: "ELSE", pattern: /else/ });
const FOR = createToken({ name: "FOR", pattern: /for/ });
const RETURN = createToken({ name: "RETURN", pattern: /return/ });
const IMPORT = createToken({ name: "IMPORT", pattern: /import/ });
const VAR = createToken({ name: "VAR", pattern: /var/ });
const VAL = createToken({ name: "VAL", pattern: /val/ });
const STATIC = createToken({ name: "STATIC", pattern: /static/ });
const GLOBAL_ZS = createToken({ name: "GLOBAL", pattern: /global/ });
const NULL = createToken({ name: "NULL", pattern: /null/ });
const TRUE = createToken({ name: "TRUE", pattern: /true/ });
const FALSE = createToken({ name: "FALSE", pattern: /false/ });

const zsAllTokens = [
  WHITE_SPACE,

  LINE_COMMENT,
  BLOCK_COMMENT,
  DOUBLE_QUOTED_STRING,
  SINGLE_QUOTED_STRING,
  PREPROCESSOR,
  EXP_NUMBER,
  FLOATING_POINT,
  DIGITS,

  L_ROUND_BRACKET,
  R_ROUND_BRACKET,
  L_ANGLE_BRACKET,
  R_ANGLE_BRACKET,
  L_SQUARE_BRACKET,
  R_SQUARE_BRACKET,
  L_CURLY_BRACKET,
  R_CURLY_BRACKET,
  TILDE,
  QUEST,
  COLON,
  PLUS,
  MINUS,
  ASTERISK,
  DIV,
  OR,
  AND,
  XOR,
  PERC,
  AT,
  HASH,
  SEMICOLON,
  COMMA,
  DOTDOT,
  DOT,
  EQEQ,
  EQUAL,
  NOT_EQUAL,
  EXCL,
  LESS_EQUAL,
  GREATER_EQUAL,
  ANY,
  BOOL,
  BYTE,
  SHORT,
  INT,
  LONG,
  FLOAT,
  DOUBLE,
  STRING,
  FUNCTION,
  TO,
  VOID,
  AS,
  VERSION,
  IF,
  ELSE,
  FOR,
  RETURN,
  IMPORT,
  VAR,
  VAL,
  STATIC,
  GLOBAL_ZS,
  NULL,
  TRUE,
  FALSE,

  IN,
  EOL,
  IDENTIFIER
];

const ZSLexer = new chevrotain.Lexer(zsAllTokens);

export {
  WHITE_SPACE,
  LINE_COMMENT,
  BLOCK_COMMENT,
  DOUBLE_QUOTED_STRING,
  SINGLE_QUOTED_STRING,
  PREPROCESSOR,
  EXP_NUMBER,
  FLOATING_POINT,
  DIGITS,
  L_ROUND_BRACKET,
  R_ROUND_BRACKET,
  L_ANGLE_BRACKET,
  R_ANGLE_BRACKET,
  L_SQUARE_BRACKET,
  R_SQUARE_BRACKET,
  L_CURLY_BRACKET,
  R_CURLY_BRACKET,
  TILDE,
  QUEST,
  COLON,
  PLUS,
  MINUS,
  ASTERISK,
  DIV,
  OR,
  AND,
  XOR,
  PERC,
  AT,
  HASH,
  SEMICOLON,
  COMMA,
  DOTDOT,
  DOT,
  EQEQ,
  EQUAL,
  NOT_EQUAL,
  EXCL,
  LESS_EQUAL,
  GREATER_EQUAL,
  ANY,
  BOOL,
  BYTE,
  SHORT,
  INT,
  LONG,
  FLOAT,
  DOUBLE,
  STRING,
  FUNCTION,
  TO,
  VOID,
  AS,
  VERSION,
  IF,
  ELSE,
  FOR,
  RETURN,
  IMPORT,
  VAR,
  VAL,
  STATIC,
  GLOBAL_ZS,
  NULL,
  TRUE,
  FALSE,
  IN,
  EOL,
  IDENTIFIER,
  zsAllTokens,
  ZSLexer
};
