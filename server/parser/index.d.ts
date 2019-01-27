export interface NodeContext {
  [key: string]: any;
}

export interface ASTNode {
  type: string;
  errors?: any[];
  [key: string]: any;
}

export interface ASTNodeProgram extends ASTNode {
  type: string = 'program';
  import: [];
  global: [];
  static: [];
}

export interface ASTNodeDeclare extends ASTNode {
  vName: string;
  // TODO: Fix variable type
  vType: string;
  value: any;
}

export interface ASTNodePackage extends ASTNode {
  type: string = 'package';
  item: string[];
}
