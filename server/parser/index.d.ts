import { CstChildrenDictionary, IToken } from 'chevrotain';

export type NodeContext = LexToken & CstChildrenDictionary;

export type LexToken = {
  EOL: IToken[];
  WHITE_SPACE: IToken[];
  LINE_COMMENT: IToken[];
  LINE_COMMENT_PREPROCESSOR: IToken[];
  BLOCK_COMMENT: IToken[];
  FLOAT_VALUE: IToken[];
  INT_VALUE: IToken[];
  STRING_VALUE: IToken[];
  A_OPEN: IToken[];
  A_CLOSE: IToken[];
  SQBR_OPEN: IToken[];
  SQBR_CLOSE: IToken[];
  DOT2: IToken[];
  DOT: IToken[];
  COMMA: IToken[];
  PLUS_ASSIGN: IToken[];
  PLUS: IToken[];
  MINUS_ASSIGN: IToken[];
  MINUS: IToken[];
  MUL_ASSIGN: IToken[];
  MUL: IToken[];
  DIV_ASSIGN: IToken[];
  DIV: IToken[];
  MOD_ASSIGN: IToken[];
  MOD: IToken[];
  OR_ASSIGN: IToken[];
  OR2: IToken[];
  OR: IToken[];
  AND_ASSIGN: IToken[];
  AND2: IToken[];
  AND: IToken[];
  XOR_ASSIGN: IToken[];
  XOR: IToken[];
  QUEST: IToken[];
  COLON: IToken[];
  BR_OPEN: IToken[];
  BR_CLOSE: IToken[];
  TILDE_ASSIGN: IToken[];
  TILDE: IToken[];
  SEMICOLON: IToken[];
  LTEQ: IToken[];
  LT: IToken[];
  GTEQ: IToken[];
  GT: IToken[];
  EQ: IToken[];
  ASSIGN: IToken[];
  NOT_EQ: IToken[];
  NOT: IToken[];
  DOLLAR: IToken[];
  DOUBLE_QUOTED_STRING: IToken[];
  SINGLE_QUOTED_STRING: IToken[];
  ANY: IToken[];
  BOOL: IToken[];
  BYTE: IToken[];
  SHORT: IToken[];
  INT: IToken[];
  LONG: IToken[];
  FLOAT: IToken[];
  DOUBLE: IToken[];
  STRING: IToken[];
  FUNCTION: IToken[];
  INSTANCEOF: IToken[];
  IN: IToken[];
  VOID: IToken[];
  AS: IToken[];
  VERSION: IToken[];
  IF: IToken[];
  ELSE: IToken[];
  FOR: IToken[];
  RETURN: IToken[];
  VAR: IToken[];
  VAL: IToken[];
  GLOBAL_ZS: IToken[];
  STATIC: IToken[];
  WHILE: IToken[];
  BREAK: IToken[];
  CONTINUE: IToken[];
  NULL: IToken[];
  TRUE: IToken[];
  FALSE: IToken[];
  IMPORT: IToken[];
  ZEN_CLASS: IToken[];
  ZEN_CONSTRUCTOR: IToken[];
  IDENTIFIER: IToken[];
};

export interface ASTNode {
  type: string;
  start: number;
  end: number;
}

export interface ASTError {
  start: number;
  end: number;
  info: string;
  message: string;
}

export interface ASTBracketHandlerError extends ASTError {
  info: 'BracketHandler error';
  isItem: boolean;
}

export interface ASTBody extends ASTNode {
  body: ASTNode[];
}

export interface ASTSymbolTable {
  subtables: ASTSymbolTable[];
  table: Map<string, ASTSymbol>;
}

export interface ASTSymbol {
  name: string;
  type: 'variable' | 'function';
  static: boolean;
  global: boolean;
}

export interface ASTScope {
  declare: Map<string, any>;
}

export interface ASTBasicProgram {
  scope: { [key: string]: 'function' | 'class' | 'global' | 'static' };
  error: ASTError[];
}

export interface ASTNodeProgram extends ASTNode, ASTBody, ASTSymbolTable {
  type: string = 'Program';
  import: ASTNodeImport[];
  table: { [key: string]: ASTSymbol };
}

export interface ASTNodeImport extends ASTNode {
  type: string = 'Import';
  package: string[];
  alias?: string;
}

export interface ASTNodeDeclare extends ASTNode {
  type: 'global' | 'static' | 'var' | 'val';
  vName: string;
  // TODO: Fix variable type
  vType: ASTNode;

  value?: ASTNode;
}

export interface ASTNodeGlobalDeclare extends ASTNodeDeclare {
  type: 'global' | 'static';
}

export interface ASTNodeFunction extends ASTNode {
  type: 'function';
  fName: string;
  fPara: any[];
  fType: any;
  fBody: ASTNode;
}

export interface ASTNodeParams extends ASTNode {
  type: 'params';
  params: any[];
}

export interface ASTNodeZenClass extends ASTNode {
  type: 'class';
  cName: string;
}

export interface ASTNodeExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: ASTNodeAssignExpression;
}

export interface ASTNodeAssignExpression extends ASTNode {
  type: 'AssignExpression';
  lhs: ASTNodeConditionalExpression;

  operator: string;
  rhs: AssignExpression;
}

export interface ASTNodeConditionalExpression extends ASTNode {
  type: 'ConditionalExpression';
  condition: ASTNodeOrOrExpression;

  valid?: ASTNodeOrOrExpression;
  invalid?: ASTNodeConditionalExpression;
}

export interface ASTNodeBinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  left: ASTNode;
  right: ASTNode;
  operator: string;
}

export interface ASTNodeUnaryExpression extends ASTNode {
  type: 'UnaryExpression';

  operator: string;
  expression: ASTNodeUnaryExpression | ASTNodePostfixExpression;
}

export interface ASTNodePostfixExpression extends ASTNode {
  type: 'PostfixExpression';
  primary: ASTNode;
}

type ASTNodePrimaryExpression =
  | ASTNodeLiteral
  | ASTNodeIdentifier
  | ASTNodeBracketHandler
  | ASTNodeAssignExpression; // TODO

export interface ASTNodeBracketHandler extends ASTNode {
  type: 'BracketHandler';
  items: string[];
}

export interface ASTNodeLiteral extends ASTNode {
  type: 'Literal';
  value: number | boolean | null | string;
  raw: string;
}

export interface ASTNodeIdentifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface ASTNodePackage extends ASTNode {
  type: string = 'package';
  item: string[];
}

export interface ASTNodeArray extends ASTNode {
  type: string = 'array';
  array: any[];
}

export interface ASTNodeMap extends ASTNode {
  type: string = 'map';
  map: Map;
}

export interface ASTNodeDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';
  id: string; // TODO: ASTNodeIdentifier
  init?: ASTNode;
}

export interface CommentEntry {
  content: string;
  start: number;
  end: number;
}
