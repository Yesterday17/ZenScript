export interface NodeContext {
  [key: string]: any;
}

export interface ASTNode {
  type: string;
  start: number;
  end: number;

  errors: ASTError[];
}

export interface ASTError {
  start: number;
  end: number;
  reason: string;
  detail: string;
}

export interface ASTBracketHandlerError extends ASTError {
  reason: 'BracketHandler error';
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
  vType: string;

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

  operator?: string;
  rhs?: AssignExpression;
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

export interface CommentEntry {
  content: string;
  start: number;
  end: number;
}
