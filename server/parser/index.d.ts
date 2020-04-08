export interface NodeContext {
  [key: string]: any;
}

export interface ASTNode {
  type: string;
  start: number;
  end?: number;

  errors?: ASTError[];
}

export interface ASTError {
  start: number;
  end: number;
  reason: string;
  detail: string;
}

export interface ASTBody extends ASTNode {
  body: ASTNode[];
}

export interface ASTSymbolTable {
  subtables: ASTSymbolTable[];
  table: Map<String, ASTSymbol>;
}

export interface ASTSymbol {
  name: string;
  type: 'variable' | 'function';
  static: boolean;
  global: boolean;
}

export interface ASTScope extends ASTNode {
  //
}

export interface ASTBasicProgram {
  scope: { [key: string]: 'function' | 'global' | 'static' };
}

export interface ASTNodeProgram extends ASTNode, ASTBody, ASTSymbolTable {
  type: string = 'Program';
  import: any[];
  table: { [key: string]: ASTSymbol };
}

export interface ASTNodeDeclare extends ASTNode {
  type: 'global' | 'static' | 'var' | 'val';
  vName: string;
  // TODO: Fix variable type
  vType: string;
  value: ASTNode;
}

export interface ASTNodeGlobalDeclare extends ASTNodeDeclare {
  type: 'global' | 'static';
}

export interface ASTNodeFunction extends ASTNode, ASTBody {
  type: 'function';
  fName: string;
  fPara: any[];
  fType: any;
}

export interface ASTNodeConditionalExpression extends ASTNode {
  type: 'ConditionalExpression';
  condition: ASTNode;

  valid?: ASTNodeOrOrExpression;
  invalid?: ASTNodeOrOrExpression;
}

export interface ASTNodeOrOrExpression extends ASTNode {
  type: 'OrOrExpression';

  left: ASTNodeOrOrExpression | ASTNodeAndAndExpression;
  right?: ASTNodeAndAndExpression;
}

export interface ASTNodeAndAndExpression extends ASTNode {
  type: 'AndAndExpression';

  left: ASTNodeAndAndExpression | ASTNodeOrExpression;
  right?: ASTNodeOrExpression;
}

export interface ASTNodeOrExpression extends ASTNode {
  type: 'OrExpression';

  left: ASTNodeOrExpression | ASTNodeXorExpression;
  right?: ASTNodeXorExpression;
}

export interface ASTNodeXorExpression extends ASTNode {
  type: 'XorExpression';

  left: ASTNodeXorExpression | ASTNodeAndExpression;
  right?: ASTNodeAndExpression;
}

export interface ASTNodeAndExpression extends ASTNode {
  type: 'AndExpression';

  left: ASTNodeAndExpression | ASTNode;
  right?: ASTNode;
}

export interface ASTNodeCompareExpression extends ASTNode {
  type: 'CompareExpression';

  operator: string;
  left: ASTNodeAddExpression;
  right?: ASTNodeAddExpression;
}

export interface ASTNodeAddExpression extends ASTNode {
  type: 'AddExpression';

  operator: string;
  left: ASTNodeAddExpression | ASTNodeMultiplyExpression;
  right?: ASTNodeMultiplyExpression; // TODO
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
