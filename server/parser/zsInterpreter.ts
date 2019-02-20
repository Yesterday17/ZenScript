import { CstNode, IToken } from 'chevrotain';
import {
  ASTNode,
  ASTNodeArray,
  ASTNodeDeclare,
  ASTNodePackage,
  ASTNodeProgram,
  NodeContext,
  ASTNodeMap,
  ASTNodeFunction,
} from '.';
import { ZSParser } from './zsParser';

/**
 * Sort a node and its bodys' body.
 * @param node The root node to sort body
 */
function sortBody(node: ASTNode): ASTNode {
  if (node.body.length > 0) {
    sortBody(node.body[0]);
    node.body.sort((a, b) => {
      sortBody(a);
      sortBody(b);
      return a.start - b.start;
    });
  }
  return node;
}

/**
 * Push a node to a parent.
 * @param node The parent node.
 * @param value The child node
 */
function pushBody(node: ASTNode, value: ASTNode): ASTNode {
  node.body.push(value);
  return node;
}

/**
 * Interpreter
 */
class ZenScriptInterpreter extends ZSParser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  protected Program(ctx: NodeContext): ASTNodeProgram {
    const program: ASTNodeProgram = {
      type: 'program',
      start: 0,
      import: new Map(),
      global: new Map(),
      static: new Map(),
      function: new Map(),
      body: [],
    };

    // If ImportList Exists
    if (ctx.ImportList) {
      program.import = this.visit(ctx.ImportList);
    }

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: any) => {
        const node: ASTNodeDeclare = this.visit(element);
        if (!program[node.type].has(node.vName)) {
          program[node.type].set(node.vName, node);
          pushBody(program, node);
        } else {
          // TODO: Error
        }
      });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: any) => {
        const func: ASTNodeFunction = this.visit(element);
        if (!program.function.has(func.fName)) {
          program.function.set(func.fName, func);
          pushBody(program, func);
        } else {
          // TODO: Error
        }
      });
    }
    sortBody(program);
    program.start = program.body[0].start;
    return program;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  protected ImportList(ctx: NodeContext) {
    return ctx.Package.map((pkg: CstNode) => this.visit(pkg));
  }

  protected GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    const declaration: ASTNodeDeclare = {
      type: 'global',
      start: -1,
      end: -1,
      vName: '',
      vType: 'any',
      value: undefined,
      body: [],
      errors: [],
    };

    declaration.type = ctx.GLOBAL_ZS ? 'global' : 'static';
    declaration.vName = ctx.vName[0].image;
    declaration.vType = ctx.vType ? this.visit(ctx.vType) : 'any';
    declaration.value = this.visit(ctx.value);

    declaration.start = ctx.GLOBAL_ZS
      ? (ctx.GLOBAL_ZS[0] as IToken).startOffset
      : (ctx.STATIC[0] as IToken).startOffset;
    declaration.end = declaration.value.end;

    if (declaration.errors.length === 0) {
      delete declaration.errors;
    }
    return declaration;
  }

  protected FunctionDeclaration(ctx: NodeContext): ASTNodeFunction {
    return {
      type: 'function',
      start: (ctx.FunctionName[0] as IToken).startOffset,
      fName: ctx.FunctionName[0].image,
      fPara: ctx.ParameterList ? this.visit(ctx.ParameterList) : [],
      fType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare) : 'any',
      body: this.visit(ctx.StatementBody),
    };
  }

  protected ZenClassDeclaration(ctx: NodeContext) {
    return '';
  }

  protected BlockStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'block-statement',
      start: 0,
      body: [],
    };
  }

  /**
   * Level 3
   * =================================================================================================
   */

  protected StatementBody(ctx: NodeContext): ASTNode {
    return {
      type: 'statement-body',
      start: 0,
      body: [],
    };
  }

  /**
   * Single statement
   */
  protected Statement(ctx: NodeContext): ASTNode {
    return {
      type: 'statement',
      start: 0,
      body: [],
    };
  }

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'return',
      start: 0,
      body: [],
    };
  }

  protected DeclareStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'declare',
      start: 0,
      body: [],
    };
  }

  protected IfStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'if',
      start: 0,
      body: [],
    };
  }

  protected ForStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'for',
      start: 0,
      body: [],
    };
  }

  protected WhileStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'while',
      start: 0,
      body: [],
    };
  }

  protected VersionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'version',
      start: 0,
      body: [],
    };
  }

  protected BreakStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'break',
      start: 0,
      body: [],
    };
  }

  protected ExpressionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'expression-statement',
      start: 0,
      body: [],
    };
  }

  /**
   * Level 5: Expressions
   * =================================================================================================
   */
  protected Expression(ctx: NodeContext): ASTNode {
    return {
      type: 'expression',
      start: 0,
      body: [],
    };
  }

  protected AssignExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-assign',
      start: 0,
      body: [],
    };
  }

  protected UnaryExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-unary',
      start: 0,
      body: [],
    };
  }

  protected AddExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-add',
      start: 0,
      body: [],
    };
  }

  protected MultiplyExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-mul',
      start: 0,
      body: [],
    };
  }

  protected CompareExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-comp',
      start: 0,
      body: [],
    };
  }

  protected AndExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-and',
      start: 0,
      body: [],
    };
  }

  protected AndAndExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-andand',
      start: 0,
      body: [],
    };
  }

  protected OrExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-or',
      start: 0,
      body: [],
    };
  }

  protected OrOrExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-oror',
      start: 0,
      body: [],
    };
  }

  protected XorExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-xor',
      start: 0,
      body: [],
    };
  }

  protected ConditionalExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-cond',
      start: 0,
      body: [],
    };
  }

  protected PostfixExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-post',
      start: 0,
      body: [],
    };
  }

  protected PrimaryExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-primary',
      start: 0,
      body: [],
    };
  }

  /**
   * Level 6 Others
   * =================================================================================================
   */
  protected LambdaFunctionDeclaration(ctx: NodeContext): ASTNode {
    return {
      type: 'lambda-function',
      start: 0,
      body: [],
    };
  }

  // TODO: Debug
  protected InBracket(ctx: NodeContext): ASTNode {
    return this.visit(ctx.AssignExpression);
  }

  // TODO: Debug
  protected BracketHandler(ctx: NodeContext): ASTNode {
    return {
      type: 'bracket-handler',
      item: ctx.$BracketHandlerItem.map((item: any) => this.visit(item)),
      start: (ctx.LT[0] as IToken).startOffset,
      body: [],
    };
  }

  // TODO: Debug
  protected BracketHandler$BracketHandlerItem(ctx: NodeContext) {
    return ctx[Object.keys(ctx)[0]].image;
  }

  protected BracketHandler$BracketHandlerItemGroup(ctx: NodeContext) {
    return '';
  }

  // TODO: Debug
  protected ZSArray(ctx: NodeContext): ASTNodeArray {
    const arr: any[] = [];
    if (ctx.AssignExpression) {
      ctx.AssignExpression.forEach((item: any) => {
        arr.push(this.visit(item));
      });
    }

    return {
      type: 'array',
      array: arr,
      start: 0,
      body: [],
    };
  }

  // TODO: Debug
  protected ZSMap(ctx: NodeContext): ASTNodeMap {
    const map = new Map();

    if (ctx.$MapEntry) {
      ctx.$MapEntry.forEach((entry: any) => {
        const e = this.visit(entry);
        if (!map.has(e[0])) {
          map.set(e[0], e[1]);
        } else {
          // TODO: Error here.
        }
      });
    }

    return {
      type: 'map',
      map: map,
      start: 0,
      body: [],
    };
  }

  // TODO: Debug
  protected ZSMap$MapEntry(ctx: NodeContext) {
    return [this.visit(ctx.KEY), this.visit(ctx.VALUE)];
  }

  protected Package(ctx: NodeContext): ASTNodePackage {
    return {
      type: 'package',
      item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      start: (ctx.IDENTIFIER[0] as IToken).startOffset,
      body: [],
    };
  }

  protected ParameterList(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter-list',
      item: ctx.Parameter.map((item: any) => this.visit(item)),
      start: 0,
      body: [],
    };
  }

  protected Parameter(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter',
      pName: ctx.IDENTIFIER[0].image,
      pType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : undefined,
      start: 0,
      body: [],
    };
  }

  protected TypeDeclare(ctx: NodeContext) {
    return this.visit(ctx.TypeAnnotation);
  }

  protected TypeAnnotation(ctx: NodeContext): ASTNode {
    let type: ASTNode;

    // Imported type
    if (ctx.IDENTIFIER) {
      type = {
        type: 'IMPORT',
        start: (ctx.IDENTIFIER[0] as IToken).startOffset,
        item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
        body: [],
      };
    }

    // Type from ANY - STRING
    if (Object.keys(ctx).length === 1) {
      type = {
        type: Object.keys(ctx)[0],
        start: 0,
        body: [],
      };
    }

    // Function type
    if (ctx.FUNCTION) {
      type = {
        type: 'FUNCTION',
        item: ctx.ParameterType.map((type: any) => this.visit(type)),
        start: (ctx.FUNCTION[0] as IToken).startOffset,
        return: this.visit(ctx.FunctionType),
        body: [],
      };
    }

    // Array type
    if (ctx.ArrayType) {
      const body: ASTNode = this.visit(ctx.ArrayType);
      type = {
        type: 'ARRAY',
        start: body.start,
        item: body,
        body: [],
      };
    }

    if (ctx.SQBR_OPEN) {
      return {
        type: 'A_ARRAY',
        start: type.start,
        level: ctx.SQBR_OPEN.length,
        body: [type],
      };
    }

    return type;
  }
}

export const ZSInterpreter = new ZenScriptInterpreter();
