// Tokens from:
// https://github.com/CraftTweaker/ZenScript/blob/bd8a3c31ac29e7a387e6bf01f0dbf36d58ed55d8/src/main/java/stanhebben/zenscript/ZenTokener.java

import * as chevrotain from 'chevrotain';

export const createToken = chevrotain.createToken;

// Skip
export const EOL = createToken({
  name: 'EOL',
  pattern: /\r?\n/,
  group: chevrotain.Lexer.SKIPPED,
});
export const WHITE_SPACE = createToken({
  name: 'WHITE_SPACE',
  pattern: /\s+/,
  group: chevrotain.Lexer.SKIPPED,
});
export const LINE_COMMENT = createToken({
  name: 'LINE_COMMENT',
  pattern: /(?:\/\/|#).*/,
  group: chevrotain.Lexer.SKIPPED,
});
export const BLOCK_COMMENT = createToken({
  name: 'BLOCK_COMMENT',
  pattern: /\/\*([^*]|\*+[^*/])*(\*+\/)?/,
  group: chevrotain.Lexer.SKIPPED,
});

// Tokens
export const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[a-zA-Z_][a-zA-Z_0-9]*/,
});
export const FLOAT_VALUE = createToken({
  name: 'FLOAT_VALUE',
  pattern: /\-?(0|[1-9][0-9]*)\.[0-9]+([eE][\+\-]?[0-9]+)?[fFdD]?/,
});
export const INT_VALUE = createToken({
  name: 'INT_VALUE',
  pattern: /(?:0x[A-Fa-f0-9]*)|(?:\-?(0|[1-9][0-9]*))/,
});
export const STRING_VALUE = createToken({
  name: 'STRING_VALUE',
  pattern: chevrotain.Lexer.NA,
});
export const A_OPEN = createToken({
  name: 'A_OPEN',
  pattern: /\{/,
});
export const A_CLOSE = createToken({
  name: 'A_CLOSE',
  pattern: /\}/,
});
export const SQBR_OPEN = createToken({
  name: 'SQBR_OPEN',
  pattern: /\[/,
});
export const SQBR_CLOSE = createToken({
  name: 'SQBR_CLOSE',
  pattern: /\]/,
});
// TODO: Separate .. & to so that 'to' can be variable name.
export const DOT2 = createToken({ name: 'DOT2', pattern: /\.\./ });
export const DOT = createToken({ name: 'DOT', pattern: /\./ });
export const COMMA = createToken({ name: 'COMMA', pattern: /\,/ });
export const PLUS_ASSIGN = createToken({ name: 'PLUS_ASSIGN', pattern: /\+=/ });
export const PLUS = createToken({ name: 'PLUS', pattern: /\+/ });
export const MINUS_ASSIGN = createToken({
  name: 'MINUS_ASSIGN',
  pattern: /\-=/,
});
export const MINUS = createToken({ name: 'MINUS', pattern: /\-/ });
export const MUL_ASSIGN = createToken({ name: 'MUL_ASSIGN', pattern: /\*=/ });
export const MUL = createToken({ name: 'MUL', pattern: /\*/ });
export const DIV_ASSIGN = createToken({ name: 'DIV_ASSIGN', pattern: /\/=/ });
export const DIV = createToken({ name: 'DIV', pattern: /\// });
export const MOD_ASSIGN = createToken({ name: 'MOD_ASSIGN', pattern: /%=/ });
export const MOD = createToken({ name: 'MOD', pattern: /%/ });
export const OR_ASSIGN = createToken({ name: 'OR_ASSIGN', pattern: /\|=/ });
export const OR2 = createToken({ name: 'OR2', pattern: /\|\|/ });
export const OR = createToken({ name: 'OR', pattern: /\|/ });
export const AND_ASSIGN = createToken({ name: 'AND_ASSIGN', pattern: /&=/ });
export const AND2 = createToken({ name: 'AND2', pattern: /&&/ });
export const AND = createToken({ name: 'AND', pattern: /&/ });
export const XOR_ASSIGN = createToken({ name: 'XOR_ASSIGN', pattern: /\^=/ });
export const XOR = createToken({ name: 'XOR', pattern: /\^/ });
export const QUEST = createToken({ name: 'QUEST', pattern: /\?/ });
export const COLON = createToken({ name: 'COLON', pattern: /:/ });
export const BR_OPEN = createToken({
  name: 'BR_OPEN',
  pattern: /\(/,
});
export const BR_CLOSE = createToken({
  name: 'BR_CLOSE',
  pattern: /\)/,
});
export const TILDE_ASSIGN = createToken({
  name: 'TILDE_ASSIGN',
  pattern: /~=/,
});
export const TILDE = createToken({ name: 'TILDE', pattern: /~/ });
export const SEMICOLON = createToken({ name: 'SEMICOLON', pattern: /;/ });
export const LTEQ = createToken({ name: 'LTEQ', pattern: /<=/ });
export const LT = createToken({ name: 'LT', pattern: /</ });
export const GTEQ = createToken({ name: 'GTEQ', pattern: />=/ });
export const GT = createToken({ name: 'GT', pattern: />/ });
export const EQ = createToken({ name: 'EQ', pattern: /==/ });
export const ASSIGN = createToken({ name: 'ASSIGN', pattern: /=/ });
export const NOT_EQ = createToken({ name: 'NOT_EQ', pattern: /!=/ });
export const NOT = createToken({ name: 'NOT', pattern: /!/ });
export const DOLLAR = createToken({ name: 'DOLLAR', pattern: /\$/ });

export const DOUBLE_QUOTED_STRING = createToken({
  name: 'DOUBLE_QUOTED_STRING',
  pattern: /\"([^\"\\]|\\([\'\"\\/bfnrt]|u[0-9a-fA-F]{4}))*\"/,
  categories: [STRING_VALUE],
});
export const SINGLE_QUOTED_STRING = createToken({
  name: 'SINGLE_QUOTED_STRING',
  pattern: /\'([^\'\\]|\\([\'\"\\/bfnrt]|u[0-9a-fA-F]{4}))*\'/,
  categories: [STRING_VALUE],
});

// Keywords
export const ANY = createToken({
  name: 'ANY',
  pattern: /any/,
  longer_alt: IDENTIFIER,
});
export const BOOL = createToken({
  name: 'BOOL',
  pattern: /bool/,
  longer_alt: IDENTIFIER,
});
export const BYTE = createToken({
  name: 'BYTE',
  pattern: /byte/,
  longer_alt: IDENTIFIER,
});
export const SHORT = createToken({
  name: 'SHORT',
  pattern: /short/,
  longer_alt: IDENTIFIER,
});
export const INT = createToken({
  name: 'INT',
  pattern: /int/,
  longer_alt: IDENTIFIER,
});
export const LONG = createToken({
  name: 'LONG',
  pattern: /long/,
  longer_alt: IDENTIFIER,
});
export const FLOAT = createToken({
  name: 'FLOAT',
  pattern: /float/,
  longer_alt: IDENTIFIER,
});
export const DOUBLE = createToken({
  name: 'DOUBLE',
  pattern: /double/,
  longer_alt: IDENTIFIER,
});
export const STRING = createToken({
  name: 'STRING',
  pattern: /string/,
  longer_alt: IDENTIFIER,
});
export const FUNCTION = createToken({
  name: 'FUNCTION',
  pattern: /function/,
  longer_alt: IDENTIFIER,
});
export const IN = createToken({
  name: 'IN',
  pattern: /in|has/,
  longer_alt: IDENTIFIER,
});
export const VOID = createToken({
  name: 'VOID',
  pattern: /void/,
  longer_alt: IDENTIFIER,
});

export const AS = createToken({
  name: 'AS',
  pattern: /as/,
  longer_alt: IDENTIFIER,
});
export const VERSION = createToken({
  name: 'VERSION',
  pattern: /version/,
  longer_alt: IDENTIFIER,
});
export const IF = createToken({
  name: 'IF',
  pattern: /if/,
  longer_alt: IDENTIFIER,
});
export const ELSE = createToken({
  name: 'ELSE',
  pattern: /else/,
  longer_alt: IDENTIFIER,
});
export const FOR = createToken({
  name: 'FOR',
  pattern: /for/,
  longer_alt: IDENTIFIER,
});
export const RETURN = createToken({
  name: 'RETURN',
  pattern: /return/,
  longer_alt: IDENTIFIER,
});
export const VAR = createToken({
  name: 'VAR',
  pattern: /var/,
  longer_alt: IDENTIFIER,
});
export const VAL = createToken({
  name: 'VAL',
  pattern: /val/,
  longer_alt: IDENTIFIER,
});
export const GLOBAL_ZS = createToken({
  name: 'GLOBAL_ZS',
  pattern: /global/,
  longer_alt: IDENTIFIER,
});
export const STATIC = createToken({
  name: 'STATIC',
  pattern: /static/,
  longer_alt: IDENTIFIER,
});
export const INSTANCEOF = createToken({
  name: 'INSTANCEOF',
  pattern: /instanceof/,
});
export const WHILE = createToken({
  name: 'WHILE',
  pattern: /while/,
  longer_alt: IDENTIFIER,
});
export const BREAK = createToken({
  name: 'BREAK',
  pattern: /break/,
  longer_alt: IDENTIFIER,
});

export const NULL = createToken({
  name: 'NULL',
  pattern: /null/,
  longer_alt: IDENTIFIER,
});
export const TRUE = createToken({
  name: 'TRUE',
  pattern: /true/,
  longer_alt: IDENTIFIER,
});
export const FALSE = createToken({
  name: 'FALSE',
  pattern: /false/,
  longer_alt: IDENTIFIER,
});

export const IMPORT = createToken({
  name: 'IMPORT',
  pattern: /import/,
  longer_alt: IDENTIFIER,
});

//TODO: Implement the following
/**
 *  KEYWORDS.put("frigginClass", T_ZEN_CLASS);
 *  KEYWORDS.put("frigginConstructor", T_ZEN_CONSTRUCTOR);
 *  KEYWORDS.put("zenClass", T_ZEN_CLASS);
 *  KEYWORDS.put("zenConstructor", T_ZEN_CONSTRUCTOR);
 */

export const zsAllTokens = [
  EOL,
  WHITE_SPACE,
  LINE_COMMENT,
  BLOCK_COMMENT,
  FLOAT_VALUE,
  INT_VALUE,
  STRING_VALUE,
  A_OPEN,
  A_CLOSE,
  SQBR_OPEN,
  SQBR_CLOSE,
  DOT2,
  DOT,
  COMMA,
  PLUS_ASSIGN,
  PLUS,
  MINUS_ASSIGN,
  MINUS,
  MUL_ASSIGN,
  MUL,
  DIV_ASSIGN,
  DIV,
  MOD_ASSIGN,
  MOD,
  OR_ASSIGN,
  OR2,
  OR,
  AND_ASSIGN,
  AND2,
  AND,
  XOR_ASSIGN,
  XOR,
  QUEST,
  COLON,
  BR_OPEN,
  BR_CLOSE,
  TILDE_ASSIGN,
  TILDE,
  SEMICOLON,
  LTEQ,
  LT,
  GTEQ,
  GT,
  EQ,
  ASSIGN,
  NOT_EQ,
  NOT,
  DOLLAR,
  DOUBLE_QUOTED_STRING,
  SINGLE_QUOTED_STRING,
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
  INSTANCEOF,
  IN,
  VOID,
  AS,
  VERSION,
  IF,
  ELSE,
  FOR,
  RETURN,
  VAR,
  VAL,
  GLOBAL_ZS,
  STATIC,
  WHILE,
  BREAK,
  NULL,
  TRUE,
  FALSE,
  IMPORT,
  IDENTIFIER,
];

export const ZSLexer = new chevrotain.Lexer(zsAllTokens);
