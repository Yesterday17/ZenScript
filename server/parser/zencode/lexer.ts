// Tokens from:
// https://github.com/ZenCodeLang/ZenCode/blob/development/Parser/src/main/java/org/openzen/zenscript/lexer/ZSTokenType.java

import * as chevrotain from 'chevrotain';

const createToken = chevrotain.createToken;

// Comment
export const T_COMMENT_SCRIPT = createToken({
  name: 'T_COMMENT_SCRIPT',
  pattern: /#[^\n]*[\n\e]/,
  group: 'COMMENT',
});
export const T_COMMENT_SINGLELINE = createToken({
  name: 'T_COMMENT_SINGLELINE',
  pattern: /\/\/[^\n]*/,
  group: 'COMMENT',
});
export const T_COMMENT_MULTILINE = createToken({
  name: 'T_COMMENT_MULTILINE',
  pattern: /\/\*([^\*]|(\*+([^\*/])))*\*+\//,
  group: 'COMMENT',
});

// Whitespaces
export const T_WHITESPACE_SPACE = createToken({
  name: 'T_WHITESPACE_SPACE',
  pattern: / /,
  group: chevrotain.Lexer.SKIPPED,
});
export const T_WHITESPACE_TAB = createToken({
  name: 'T_WHITESPACE_TAB',
  pattern: /\t/,
  group: chevrotain.Lexer.SKIPPED,
});
export const T_WHITESPACE_NEWLINE = createToken({
  name: 'T_WHITESPACE_NEWLINE',
  pattern: /\n/,
  group: chevrotain.Lexer.SKIPPED,
});
export const T_WHITESPACE_CARRIAGE_RETURN = createToken({
  name: 'T_WHITESPACE_CARRIAGE_RETURN',
  pattern: /\r/,
  group: chevrotain.Lexer.SKIPPED,
});

export const T_IDENTIFIER = createToken({
  name: 'T_IDENTIFIER',
  pattern: /@?[a-zA-Z_][a-zA-Z_0-9]*/,
});
export const T_LOCAL_IDENTIFIER = createToken({
  name: 'T_LOCAL_IDENTIFIER',
  pattern: /\$[a-zA-Z_][a-zA-Z_0-9]*/,
});

// Literals
export const T_FLOAT = createToken({
  name: 'T_FLOAT',
  pattern: /\-?(0|[1-9][0-9]*)\.[0-9]+([eE][\+\-]?[0-9]+)?[a-zA-Z_]*/,
});
export const T_INT = createToken({
  name: 'T_INT',
  pattern: /\-?(0|[1-9][0-9_]*)[a-zA-Z_]*/,
});
export const T_PREFIXED_INT = createToken({
  name: 'T_PREFIXED_INT',
  pattern: /\-?(0b|0x|0o|0B|0X|0O)(0|[1-9a-fA-F][0-9a-fA-F_]*)[a-zA-Z_]*/,
});
export const T_STRING_DQ = createToken({
  name: 'T_STRING_DQ',
  pattern: /"([^"\\\n]|\\(['"\\/bfnrt&]|u[0-9a-fA-F]{4}))*"/,
});
export const T_STRING_DQ_WYSIWYG = createToken({
  name: 'T_STRING_DQ_WYSIWYG',
  pattern: /@"[^"]"/,
});
export const T_STRING_SQ = createToken({
  name: 'T_STRING_SQ',
  pattern: /'([^'\\\n]|\\(['"\\/bfnrt&]|u[0-9a-fA-F]{4}))*\'/,
});
export const T_STRING_SQ_WYSIWYG = createToken({
  name: 'T_STRING_SQ_WYSIWYG',
  pattern: /@'[^']'/,
});

// Symbols
export const T_AOPEN = createToken({
  name: 'T_AOPEN',
  pattern: /\{/,
});
export const T_ACLOSE = createToken({
  name: 'T_ACLOSE',
  pattern: /\}/,
});
export const T_SQOPEN = createToken({
  name: 'T_SQOPEN',
  pattern: /\[/,
});
export const T_SQCLOSE = createToken({
  name: 'T_SQCLOSE',
  pattern: /\]/,
});
export const T_DOT3 = createToken({
  name: 'T_DOT3',
  pattern: /\.\.\./,
});
export const T_DOT2 = createToken({
  name: 'T_DOT2',
  pattern: /\.\./,
});
export const T_DOT = createToken({
  name: 'T_DOT',
  pattern: /\./,
});
export const T_COMMA = createToken({
  name: 'T_COMMA',
  pattern: /,/,
});
export const T_INCREMENT = createToken({
  name: 'T_INCREMENT',
  pattern: /\+\+/,
});
export const T_ADDASSIGN = createToken({
  name: 'T_ADDASSIGN',
  pattern: /\+=/,
});
export const T_ADD = createToken({
  name: 'T_ADD',
  pattern: /\+/,
});
export const T_DECREMENT = createToken({
  name: 'T_DECREMENT',
  pattern: /\-\-/,
});
export const T_SUBASSIGN = createToken({
  name: 'T_SUBASSIGN',
  pattern: /\-=/,
});
export const T_SUB = createToken({
  name: 'T_SUB',
  pattern: /\-/,
});
export const T_CATASSIGN = createToken({
  name: 'T_CATASSIGN',
  pattern: /~=/,
});
export const T_CAT = createToken({
  name: 'T_CAT',
  pattern: /~/,
});
export const T_MULASSIGN = createToken({
  name: 'T_MULASSIGN',
  pattern: /\*=/,
});
export const T_MUL = createToken({
  name: 'T_MUL',
  pattern: /\*/,
});
export const T_DIVASSIGN = createToken({
  name: 'T_DIVASSIGN',
  pattern: /\/=/,
});
export const T_DIV = createToken({
  name: 'T_DIV',
  pattern: /\//,
});
export const T_MODASSIGN = createToken({
  name: 'T_MODASSIGN',
  pattern: /%=/,
});
export const T_MOD = createToken({
  name: 'T_MOD',
  pattern: /%/,
});
export const T_ORASSIGN = createToken({
  name: 'T_ORASSIGN',
  pattern: /\|=/,
});
export const T_OROR = createToken({
  name: 'T_OROR',
  pattern: /\|\|/,
});
export const T_OR = createToken({
  name: 'T_OR',
  pattern: /\|/,
});
export const T_ANDASSIGN = createToken({
  name: 'T_ANDASSIGN',
  pattern: /&=/,
});
export const T_ANDAND = createToken({
  name: 'T_ANDAND',
  pattern: /&&/,
});
export const T_AND = createToken({
  name: 'T_AND',
  pattern: /&/,
});
export const T_XORASSIGN = createToken({
  name: 'T_XORASSIGN',
  pattern: /\^=/,
});
export const T_XOR = createToken({
  name: 'T_XOR',
  pattern: /\^/,
});
export const T_COALESCE = createToken({
  name: 'T_COALESCE',
  pattern: /\?\?/,
});
export const T_OPTCALL = createToken({
  name: 'T_OPTCALL',
  pattern: /\?\./,
});
export const T_QUEST = createToken({
  name: 'T_QUEST',
  pattern: /\?/,
});
export const T_COLON = createToken({
  name: 'T_COLON',
  pattern: /:/,
});
export const T_BROPEN = createToken({
  name: 'T_BROPEN',
  pattern: /\(/,
});
export const T_BRCLOSE = createToken({
  name: 'T_BRCLOSE',
  pattern: /\)/,
});
export const T_SEMICOLON = createToken({
  name: 'T_SEMICOLON',
  pattern: /;/,
});
export const T_LESSEQ = createToken({
  name: 'T_LESSEQ',
  pattern: /<=/,
});
export const T_SHLASSIGN = createToken({
  name: 'T_SHLASSIGN',
  pattern: /<<=/,
});
export const T_SHL = createToken({
  name: 'T_SHL',
  pattern: /<</,
});
export const T_LESS = createToken({
  name: 'T_LESS',
  pattern: /</,
});
export const T_GREATEREQ = createToken({
  name: 'T_GREATEREQ',
  pattern: />=/,
});
export const T_USHR = createToken({
  name: 'T_USHR',
  pattern: />>>/,
});
export const T_USHRASSIGN = createToken({
  name: 'T_USHRASSIGN',
  pattern: />>>=/,
});
export const T_SHRASSIGN = createToken({
  name: 'T_SHRASSIGN',
  pattern: />>=/,
});
export const T_SHR = createToken({
  name: 'T_SHR',
  pattern: />>/,
});
export const T_GREATER = createToken({
  name: 'T_GREATER',
  pattern: />/,
});
export const T_LAMBDA = createToken({
  name: 'T_LAMBDA',
  pattern: /=>/,
});
export const T_EQUAL3 = createToken({
  name: 'T_EQUAL3',
  pattern: /===/,
});
export const T_EQUAL2 = createToken({
  name: 'T_EQUAL2',
  pattern: /==/,
});
export const T_ASSIGN = createToken({
  name: 'T_ASSIGN',
  pattern: /=/,
});
export const T_NOTEQUAL2 = createToken({
  name: 'T_NOTEQUAL2',
  pattern: /!==/,
});
export const T_NOTEQUAL = createToken({
  name: 'T_NOTEQUAL',
  pattern: /!=/,
});
export const T_NOT = createToken({
  name: 'T_NOT',
  pattern: /!/,
});
export const T_DOLLAR = createToken({
  name: 'T_DOLLAR',
  pattern: /\$/,
});
export const T_BACKTICK = createToken({
  name: 'T_BACKTICK',
  pattern: /`/,
});

// Top keywords
export const K_IMPORT = createToken({
  name: 'K_IMPORT',
  pattern: /import/,
  longer_alt: T_IDENTIFIER,
});
export const K_ALIAS = createToken({
  name: 'K_ALIAS',
  pattern: /alias/,
  longer_alt: T_IDENTIFIER,
});
export const K_CLASS = createToken({
  name: 'K_CLASS',
  pattern: /class/,
  longer_alt: T_IDENTIFIER,
});
export const K_FUNCTION = createToken({
  name: 'K_FUNCTION',
  pattern: /function/,
  longer_alt: T_IDENTIFIER,
});
export const K_INTERFACE = createToken({
  name: 'K_INTERFACE',
  pattern: /interface/,
  longer_alt: T_IDENTIFIER,
});
export const K_ENUM = createToken({
  name: 'K_ENUM',
  pattern: /enum/,
  longer_alt: T_IDENTIFIER,
});
export const K_STRUCT = createToken({
  name: 'K_STRUCT',
  pattern: /struct/,
  longer_alt: T_IDENTIFIER,
});
export const K_EXPAND = createToken({
  name: 'K_EXPAND',
  pattern: /expand/,
  longer_alt: T_IDENTIFIER,
});
export const K_VARIANT = createToken({
  name: 'K_VARIANT',
  pattern: /variant/,
  longer_alt: T_IDENTIFIER,
});

// Modifier keywords
export const K_ABSTRACT = createToken({
  name: 'K_ABSTRACT',
  pattern: /abstract/,
  longer_alt: T_IDENTIFIER,
});
export const K_FINAL = createToken({
  name: 'K_FINAL',
  pattern: /final/,
  longer_alt: T_IDENTIFIER,
});
export const K_OVERRIDE = createToken({
  name: 'K_OVERRIDE',
  pattern: /override/,
  longer_alt: T_IDENTIFIER,
});
export const K_CONST = createToken({
  name: 'K_CONST',
  pattern: /const/,
  longer_alt: T_IDENTIFIER,
});
export const K_PRIVATE = createToken({
  name: 'K_PRIVATE',
  pattern: /private/,
  longer_alt: T_IDENTIFIER,
});
export const K_PUBLIC = createToken({
  name: 'K_PUBLIC',
  pattern: /public/,
  longer_alt: T_IDENTIFIER,
});
export const K_EXPORT = createToken({
  name: 'K_EXPORT',
  pattern: /export/,
  longer_alt: T_IDENTIFIER,
});
export const K_INTERNAL = createToken({
  name: 'K_INTERNAL',
  pattern: /internal/,
  longer_alt: T_IDENTIFIER,
});
export const K_STATIC = createToken({
  name: 'K_STATIC',
  pattern: /static/,
  longer_alt: T_IDENTIFIER,
});
export const K_PROTECTED = createToken({
  name: 'K_PROTECTED',
  pattern: /protected/,
  longer_alt: T_IDENTIFIER,
});
export const K_IMPLICIT = createToken({
  name: 'K_IMPLICIT',
  pattern: /implicit/,
  longer_alt: T_IDENTIFIER,
});
export const K_VIRTUAL = createToken({
  name: 'K_VIRTUAL',
  pattern: /virtual/,
  longer_alt: T_IDENTIFIER,
});
export const K_EXTERN = createToken({
  name: 'K_EXTERN',
  pattern: /extern/,
  longer_alt: T_IDENTIFIER,
});
export const K_IMMUTABLE = createToken({
  name: 'K_IMMUTABLE',
  pattern: /immutable/,
  longer_alt: T_IDENTIFIER,
});

// Defination Keywords
export const K_VAL = createToken({
  name: 'K_VAL',
  pattern: /val/,
  longer_alt: T_IDENTIFIER,
});
export const K_VAR = createToken({
  name: 'K_VAR',
  pattern: /var/,
  longer_alt: T_IDENTIFIER,
});
export const K_GET = createToken({
  name: 'K_GET',
  pattern: /get/,
  longer_alt: T_IDENTIFIER,
});
export const K_IMPLEMENTS = createToken({
  name: 'K_IMPLEMENTS',
  pattern: /implements/,
  longer_alt: T_IDENTIFIER,
});
export const K_SET = createToken({
  name: 'K_SET',
  pattern: /set/,
  longer_alt: T_IDENTIFIER,
});

// Type keywords
export const K_VOID = createToken({
  name: 'K_VOID',
  pattern: /void/,
  longer_alt: T_IDENTIFIER,
});
export const K_BOOL = createToken({
  name: 'K_BOOL',
  pattern: /bool/,
  longer_alt: T_IDENTIFIER,
});
export const K_BYTE = createToken({
  name: 'K_BYTE',
  pattern: /byte/,
  longer_alt: T_IDENTIFIER,
});
export const K_SBYTE = createToken({
  name: 'K_SBYTE',
  pattern: /sbyte/,
  longer_alt: T_IDENTIFIER,
});
export const K_SHORT = createToken({
  name: 'K_SHORT',
  pattern: /short/,
  longer_alt: T_IDENTIFIER,
});
export const K_USHORT = createToken({
  name: 'K_USHORT',
  pattern: /ushort/,
  longer_alt: T_IDENTIFIER,
});
export const K_INT = createToken({
  name: 'K_INT',
  pattern: /int/,
  longer_alt: T_IDENTIFIER,
});
export const K_UINT = createToken({
  name: 'K_UINT',
  pattern: /uint/,
  longer_alt: T_IDENTIFIER,
});
export const K_LONG = createToken({
  name: 'K_LONG',
  pattern: /long/,
  longer_alt: T_IDENTIFIER,
});
export const K_ULONG = createToken({
  name: 'K_ULONG',
  pattern: /ulong/,
  longer_alt: T_IDENTIFIER,
});
export const K_USIZE = createToken({
  name: 'K_USIZE',
  pattern: /usize/,
  longer_alt: T_IDENTIFIER,
});
export const K_FLOAT = createToken({
  name: 'K_FLOAT',
  pattern: /float/,
  longer_alt: T_IDENTIFIER,
});
export const K_DOUBLE = createToken({
  name: 'K_DOUBLE',
  pattern: /double/,
  longer_alt: T_IDENTIFIER,
});
export const K_CHAR = createToken({
  name: 'K_CHAR',
  pattern: /char/,
  longer_alt: T_IDENTIFIER,
});
export const K_STRING = createToken({
  name: 'K_STRING',
  pattern: /string/,
  longer_alt: T_IDENTIFIER,
});

// Control keywords
export const K_IF = createToken({
  name: 'K_IF',
  pattern: /if/,
  longer_alt: T_IDENTIFIER,
});
export const K_ELSE = createToken({
  name: 'K_ELSE',
  pattern: /else/,
  longer_alt: T_IDENTIFIER,
});
export const K_DO = createToken({
  name: 'K_DO',
  pattern: /do/,
  longer_alt: T_IDENTIFIER,
});
export const K_WHILE = createToken({
  name: 'K_WHILE',
  pattern: /while/,
  longer_alt: T_IDENTIFIER,
});
export const K_FOR = createToken({
  name: 'K_FOR',
  pattern: /for/,
  longer_alt: T_IDENTIFIER,
});
export const K_THROW = createToken({
  name: 'K_THROW',
  pattern: /throw/,
  longer_alt: T_IDENTIFIER,
});
export const K_PANIC = createToken({
  name: 'K_PANIC',
  pattern: /panic/,
  longer_alt: T_IDENTIFIER,
});
export const K_LOCK = createToken({
  name: 'K_LOCK',
  pattern: /lock/,
  longer_alt: T_IDENTIFIER,
});
export const K_TRY = createToken({
  name: 'K_TRY',
  pattern: /try/,
  longer_alt: T_IDENTIFIER,
});
export const K_CATCH = createToken({
  name: 'K_CATCH',
  pattern: /catch/,
  longer_alt: T_IDENTIFIER,
});
export const K_FINALLY = createToken({
  name: 'K_FINALLY',
  pattern: /finally/,
  longer_alt: T_IDENTIFIER,
});
export const K_RETURN = createToken({
  name: 'K_RETURN',
  pattern: /return/,
  longer_alt: T_IDENTIFIER,
});
export const K_BREAK = createToken({
  name: 'K_BREAK',
  pattern: /break/,
  longer_alt: T_IDENTIFIER,
});
export const K_CONTINUE = createToken({
  name: 'K_CONTINUE',
  pattern: /continue/,
  longer_alt: T_IDENTIFIER,
});
export const K_SWITCH = createToken({
  name: 'K_SWITCH',
  pattern: /switch/,
  longer_alt: T_IDENTIFIER,
});
export const K_CASE = createToken({
  name: 'K_CASE',
  pattern: /case/,
  longer_alt: T_IDENTIFIER,
});
export const K_DEFAULT = createToken({
  name: 'K_DEFAULT',
  pattern: /default/,
  longer_alt: T_IDENTIFIER,
});

// Match keywords
export const K_IN = createToken({
  name: 'K_IN',
  pattern: /in/,
  longer_alt: T_IDENTIFIER,
});
export const K_IS = createToken({
  name: 'K_IS',
  pattern: /is/,
  longer_alt: T_IDENTIFIER,
});
export const K_AS = createToken({
  name: 'K_AS',
  pattern: /as/,
  longer_alt: T_IDENTIFIER,
});
export const K_MATCH = createToken({
  name: 'K_MATCH',
  pattern: /match/,
  longer_alt: T_IDENTIFIER,
});
export const K_THROWS = createToken({
  name: 'K_THROWS',
  pattern: /throws/,
  longer_alt: T_IDENTIFIER,
});

// Other keywords
export const K_SUPER = createToken({
  name: 'K_SUPER',
  pattern: /super/,
  longer_alt: T_IDENTIFIER,
});
export const K_THIS = createToken({
  name: 'K_THIS',
  pattern: /this/,
  longer_alt: T_IDENTIFIER,
});
export const K_NULL = createToken({
  name: 'K_NULL',
  pattern: /null/,
  longer_alt: T_IDENTIFIER,
});
export const K_TRUE = createToken({
  name: 'K_TRUE',
  pattern: /true/,
  longer_alt: T_IDENTIFIER,
});
export const K_FALSE = createToken({
  name: 'K_FALSE',
  pattern: /false/,
  longer_alt: T_IDENTIFIER,
});
export const K_NEW = createToken({
  name: 'K_NEW',
  pattern: /new/,
  longer_alt: T_IDENTIFIER,
});

export const ZenCodeAllTokens = [
  T_COMMENT_SCRIPT,
  T_COMMENT_SINGLELINE,
  T_COMMENT_MULTILINE,
  T_WHITESPACE_SPACE,
  T_WHITESPACE_TAB,
  T_WHITESPACE_NEWLINE,
  T_WHITESPACE_CARRIAGE_RETURN,
  T_FLOAT,
  T_INT,
  T_PREFIXED_INT,
  T_STRING_DQ,
  T_STRING_DQ_WYSIWYG,
  T_STRING_SQ,
  T_STRING_SQ_WYSIWYG,
  T_AOPEN,
  T_ACLOSE,
  T_SQOPEN,
  T_SQCLOSE,
  T_DOT3,
  T_DOT2,
  T_DOT,
  T_COMMA,
  T_INCREMENT,
  T_ADDASSIGN,
  T_ADD,
  T_DECREMENT,
  T_SUBASSIGN,
  T_SUB,
  T_CATASSIGN,
  T_CAT,
  T_MULASSIGN,
  T_MUL,
  T_DIVASSIGN,
  T_DIV,
  T_MODASSIGN,
  T_MOD,
  T_ORASSIGN,
  T_OROR,
  T_OR,
  T_ANDASSIGN,
  T_ANDAND,
  T_AND,
  T_XORASSIGN,
  T_XOR,
  T_COALESCE,
  T_OPTCALL,
  T_QUEST,
  T_COLON,
  T_BROPEN,
  T_BRCLOSE,
  T_SEMICOLON,
  T_LESSEQ,
  T_SHLASSIGN,
  T_SHL,
  T_LESS,
  T_GREATEREQ,
  T_USHRASSIGN,
  T_USHR,
  T_SHRASSIGN,
  T_SHR,
  T_GREATER,
  T_LAMBDA,
  T_EQUAL3,
  T_EQUAL2,
  T_ASSIGN,
  T_NOTEQUAL2,
  T_NOTEQUAL,
  T_NOT,
  T_DOLLAR,
  T_BACKTICK,

  K_IS,
  K_AS,
  K_MATCH,
  K_THROWS,

  K_IF,
  K_ELSE,
  K_WHILE,
  K_FOR,
  K_THROW,
  K_PANIC,
  K_LOCK,
  K_TRY,
  K_CATCH,
  K_FINALLY,
  K_RETURN,
  K_BREAK,
  K_CONTINUE,
  K_SWITCH,
  K_CASE,
  K_DEFAULT,

  K_IMPORT,
  K_ALIAS,
  K_CLASS,
  K_FUNCTION,
  K_INTERFACE,
  K_ENUM,
  K_STRUCT,
  K_EXPAND,
  K_VARIANT,

  K_ABSTRACT,
  K_FINAL,
  K_OVERRIDE,
  K_CONST,
  K_PRIVATE,
  K_PUBLIC,
  K_EXPORT,
  K_INTERNAL,
  K_STATIC,
  K_PROTECTED,
  K_IMPLICIT,
  K_VIRTUAL,
  K_EXTERN,
  K_IMMUTABLE,

  K_VAL,
  K_VAR,
  K_GET,
  K_IMPLEMENTS,
  K_SET,

  K_VOID,
  K_BOOL,
  K_BYTE,
  K_SBYTE,
  K_SHORT,
  K_USHORT,
  K_INT,
  K_UINT,
  K_LONG,
  K_ULONG,
  K_USIZE,
  K_FLOAT,
  K_DOUBLE,
  K_CHAR,
  K_STRING,

  K_SUPER,
  K_THIS,
  K_NULL,
  K_TRUE,
  K_FALSE,
  K_NEW,

  K_IN,
  K_DO,

  T_IDENTIFIER,
  T_LOCAL_IDENTIFIER,
];

export const ZCLexer = new chevrotain.Lexer(ZenCodeAllTokens);
