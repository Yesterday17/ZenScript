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

/**
 * Offset property, includes start offset & end offset
 */
export interface Offset {
  start: number;
  end: number;
}

/**
 * Base AST Node, includes type information and Offset
 */
export interface ASTNode extends Offset {
  type: string;
}

/**
 * Body part of AST Node, can be extended by AST Nodes using body
 */
export interface ASTBody {
  body: ASTNode[];
}

/**
 * Error when generating AST and interpreting
 */
export interface ASTError extends Offset {
  info: string;
  message: string;
}

export interface ASTBracketHandlerError extends ASTError {
  info: 'BracketHandler error';
  isItem: boolean;
}

export interface ASTSymbol {
  name: string;
  type: 'variable' | 'function';
  static: boolean;
  global: boolean;
}

export interface ASTBasicProgram {
  scope: { [key: string]: 'function' | 'class' | 'global' | 'static' };
  error: ASTError[];
}

export interface ASTNodeProgram extends ASTNode, ASTBody {
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

export interface ASTNodeIfStatement extends ASTNode {
  type: 'IfStatement';
  test: ASTNode;
  consequent: ASTNode;
  alternate?: ASTNode;
}

export interface ASTNodeWhileStatement extends ASTNode {
  type: 'WhileStatement';
  test: ASTNode;
  body: ASTNode;
}

export interface ASTNodeReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument?: ASTNode;
}

export interface ASTNodeExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: ASTNodeAssignExpression;
}

export interface ASTNodeBreakStatement extends ASTNode {
  type: 'BreakStatement';
}

export interface ASTNodeContinueStatement extends ASTNode {
  type: 'ContinueStatement';
}

export interface ASTNodeVersionStatement extends ASTNode {
  type: 'VersionStatement';
  version: number;
}

export interface ASTNodeBlockStatement extends ASTNode {
  type: 'BlockStatement';
  body: ASTNode[];
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

export interface ASTNodeMapEntry extends ASTNode {
  type: 'MapEntry';
  key: ASTNode;
  value: ASTNode;
}

export interface ASTNodeDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';
  id: ASTNodeIdentifier;
  init?: ASTNode;
}

export interface CommentEntry {
  content: string;
  start: number;
  end: number;
}
