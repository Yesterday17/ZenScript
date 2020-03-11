import { CstNode, IToken } from 'chevrotain';
import get from 'get-value';
import {
  ASTBody,
  ASTNode,
  ASTNodeArray,
  ASTNodeDeclare,
  ASTNodeFunction,
  ASTNodeMap,
  ASTNodePackage,
  ASTNodeProgram,
  NodeContext,
} from '.';
import { zGlobal } from '../api/global';
import { ZSParser } from './zsParser';

/**
 * Sort a node and its bodys' body.
 * @param node The root node to sort body
 */
function sortBody(node: ASTBody): ASTNode {
  if (node.body.length > 0) {
    node.body.sort((a, b) => {
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
function pushBody(node: ASTBody, value: ASTNode): ASTNode {
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
    const node: ASTNodeProgram = {
      type: 'Program',
      import: [],
      start: 0,
      body: [],
      subtables: [],
      table: new Map(),
      errors: [],
    };

    if (ctx.ImportStatement) {
      ctx.ImportStatement.forEach((imp: any) => {
        const r = this.visit(imp);
        node.errors.push(...r.errors);
        delete r.errors;
        node.import.push(r);
      });
    }

    if (ctx.GlobalStaticDeclaration) {
      // ctx.GlobalStaticDeclaration.forEach((element: any) => {
      //   const child: ASTNodeDeclare = this.visit(element);
      //   if (!node[child.type].has(child.vName)) {
      //     node[child.type].set(child.vName, node);
      //     pushBody(node, node);
      //   } else {
      //     // TODO: Error
      //   }
      // });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: any) => {
        const func: ASTNodeFunction = this.visit(element);
        if (node.table.has(func.fName)) {
          // TODO: Error
          return;
        }
        // TODO: Override
        // FIXME: global/static
        node.table.set(func.fName, {
          name: func.fName,
          type: 'function',
          global: false,
          static: false,
        });
        pushBody(node, func);
      });
    }
    sortBody(node);

    // Update if body exists
    if (node.body.length > 0) {
      node.start = node.body[0].start;
    }
    return node;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  protected ImportStatement(ctx: NodeContext) {
    const token: {
      start: number;
      package: any;
      errors: Object[];
      alias?: string;
    } = {
      start: ctx.IMPORT[0].startOffset,
      package: ctx.Package.map((pkg: CstNode) => this.visit(pkg))[0].item,
      errors: [],
    };
    if (ctx.alias && ctx.alias.length && ctx.alias.length === 1) {
      token.alias = ctx.alias[0].image;
    }
    if (!get(zGlobal.packages, token.package)) {
      token.errors.push({
        start: token.start,
        end: ctx.SEMICOLON[0].endOffset,
        message: 'Unknown package: ' + token.package.join('.'),
      });
    }
    return token;
  }

  protected GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    const declaration: ASTNodeDeclare = {
      type: 'global',
      start: -1,
      end: -1,
      vName: '',
      vType: 'any',
      value: undefined,

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

  protected ZenClassDeclaration(ctx: NodeContext): ASTNode {
    return {
      type: 'zenclass',
      start: 0,
    };
  }

  protected BlockStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'block-statement',
      start: 0,
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
    };
  }

  /**
   * Single statement
   */
  protected Statement(ctx: NodeContext): ASTNode {
    return {
      type: 'statement',
      start: 0,
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
    };
  }

  protected DeclareStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'declare',
      start: 0,
    };
  }

  protected IfStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'if',
      start: 0,
    };
  }

  protected ForStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'for',
      start: 0,
    };
  }

  protected WhileStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'while',
      start: 0,
    };
  }

  protected VersionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'version',
      start: 0,
    };
  }

  protected BreakStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'break',
      start: 0,
    };
  }

  protected ExpressionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'expression-statement',
      start: 0,
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
    };
  }

  protected AssignExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-assign',
      start: 0,
    };
  }

  protected UnaryExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-unary',
      start: 0,
    };
  }

  protected AddExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-add',
      start: 0,
    };
  }

  protected MultiplyExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-mul',
      start: 0,
    };
  }

  protected CompareExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-comp',
      start: 0,
    };
  }

  protected AndExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-and',
      start: 0,
    };
  }

  protected AndAndExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-andand',
      start: 0,
    };
  }

  protected OrExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-or',
      start: 0,
    };
  }

  protected OrOrExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-oror',
      start: 0,
    };
  }

  protected XorExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-xor',
      start: 0,
    };
  }

  protected ConditionalExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-cond',
      start: 0,
    };
  }

  protected PostfixExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-post',
      start: 0,
    };
  }

  protected PrimaryExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-primary',
      start: 0,
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
      // item: ctx.$BracketHandlerItem.map((item: any) => this.visit(item)),
      start: (ctx.LT[0] as IToken).startOffset,
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
    };
  }

  // TODO: Debug
  protected ZSMap(ctx: NodeContext): ASTNodeMap {
    const map = new Map();

    if (ctx.ZSMapEntry) {
      ctx.ZSMapEntry.forEach((entry: any) => {
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
    };
  }

  // TODO: Debug
  protected ZSMapEntry(ctx: NodeContext) {
    return [this.visit(ctx.KEY), this.visit(ctx.VALUE)];
  }

  protected Package(ctx: NodeContext): ASTNodePackage {
    return {
      type: 'package',
      item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      start: (ctx.IDENTIFIER[0] as IToken).startOffset,
    };
  }

  protected ParameterList(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter-list',
      // item: ctx.Parameter.map((item: any) => this.visit(item)),
      start: 0,
    };
  }

  protected Parameter(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter',
      // pName: ctx.IDENTIFIER[0].image,
      // pType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : undefined,
      start: 0,
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
        // item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      };
    }

    // Type from ANY - STRING
    if (Object.keys(ctx).length === 1) {
      type = {
        type: Object.keys(ctx)[0],
        start: 0,
      };
    }

    // Function type
    if (ctx.FUNCTION) {
      type = {
        type: 'FUNCTION',
        // item: ctx.ParameterType.map((type: any) => this.visit(type)),
        start: (ctx.FUNCTION[0] as IToken).startOffset,
        // return: this.visit(ctx.FunctionType),
      };
    }

    // Array type
    if (ctx.ArrayType) {
      const body: ASTNode = this.visit(ctx.ArrayType);
      type = {
        type: 'ARRAY',
        start: body.start,
        // item: body,
      };
    }

    if (ctx.SQBR_OPEN) {
      return {
        type: 'A_ARRAY',
        start: type.start,
        // level: ctx.SQBR_OPEN.length,
        // body: [type],
      };
    }

    return type;
  }
}

export const ZSInterpreter = new ZenScriptInterpreter();
