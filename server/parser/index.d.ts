export interface NodeContext {
  [key: string]: any;
}

export interface ASTNode {
  type: string;
  start: number;
  end?: number;

  body: ASTNode[];
  errors?: any[];
  [key: string]: any;
}

export interface ASTNodeProgram extends ASTNode {
  type: string = 'program';
  import: Map;
  global: Map;
  static: Map;
  function: Map;
  body: ASTNode[];
}

export interface ASTNodeDeclare extends ASTNode {
  vName: string;
  // TODO: Fix variable type
  vType: string;
  value: ASTNode;
}

export interface ASTNodeFunction extends ASTNode {
  type: 'function';
  fName: string;
  fPara: any[];
  fType: any;
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
