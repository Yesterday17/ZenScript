/* eslint-disable @typescript-eslint/ban-types */
import { CstElement, CstNode, IToken } from 'chevrotain';
import get from 'get-value';
import {
  ASTBracketHandlerError,
  ASTError,
  ASTNode,
  ASTNodeArray,
  ASTNodeAssignExpression,
  ASTNodeBinaryExpression,
  ASTNodeBracketHandler,
  ASTNodeConditionalExpression,
  ASTNodeDeclaration,
  ASTNodeDeclare,
  ASTNodeExpressionStatement,
  ASTNodeFunction,
  ASTNodeIfStatement,
  ASTNodeImport,
  ASTNodeMap,
  ASTNodePackage,
  ASTNodeParams,
  ASTNodePostfixExpression,
  ASTNodePrimaryExpression,
  ASTNodeProgram,
  ASTNodeReturnStatement,
  ASTNodeUnaryExpression,
  NodeContext,
} from '.';
import { ERROR_BRACKET_HANDLER } from '../api/constants';
import { zGlobal } from '../api/global';
import { BracketHandlerMap } from '../completion/bracketHandler/bracketHandlers';
import { ZSParser } from './zsParser';

/**
 * Interpreter
 *
 * AST for ZenScript
 * The interpreter generates a common Abstract Syntax Tree.
 * The tree follows this pattern:
 * [Program]
 *  |-import    All import statements are stored here.
 *  |-declare   All global-scoped declarations are stored here.
 *    |-global    Variables declared by `global` keyword. Only available when `declare` is direct child of `Program`.
 *    |-static    Variables declared by `static` keyword. Only available when `declare` is direct child of `Program`.
 *    |-var       Variables declared by `var` keyword.
 *    |-val       Variables declared by `val` keyword.
 *    |-function  Functions.
 *    |-class     ZenClasses.
 *  |-body      ALl statements stores here. It's an array of ASTNode, sorted by nodes' position.
 */
class ZenScriptInterpreter extends ZSParser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  protected zsVisit<T extends ASTNode>(
    element: CstElement | CstNode | CstElement[] | CstNode[],
    err: ASTError[],
    position = false
  ): T {
    if (Array.isArray(element)) {
      element = element[0] as CstNode;
    } else {
      element = element as CstNode;
    }

    const node: T = this.visit(element as CstNode, err);

    if (position && element.location) {
      node.start = element.location.startOffset;
      node.end = element.location.endOffset;
    }

    return node;
  }

  protected parseBinaryExpression(
    operators: CstElement[],
    rules: CstElement[],
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    const first: ASTNode = this.zsVisit(rules[0], err);
    if (!operators) {
      // operators undefined
      return first;
    }

    let root: ASTNodeBinaryExpression = {
      type: 'BinaryExpression',
      start: first.start,
      end: -1,
      left: first,
      right: undefined,
      operator: '',
    };

    operators.forEach((op: IToken, i) => {
      root.operator = op.image;
      root.right = this.zsVisit(rules[i + 1], err);

      if (i === operators.length - 1) {
        // last item
        root.end = root.right.end;
      } else {
        root = {
          type: 'BinaryExpression',
          start: root.left.start,
          end: -1,
          left: root,
          right: undefined,
          operator: '',
        };
      }
    });

    return root;
  }

  protected Program(ctx: NodeContext, err: ASTError[]): ASTNodeProgram {
    const node: ASTNodeProgram = {
      type: 'Program',
      import: [],
      start: 0,
      end: 0,
      body: [],
      table: {}, // Scope table
    };

    if (ctx.ImportStatement) {
      ctx.ImportStatement.forEach((imp: CstNode) => {
        const r = this.visit(imp, err);
        node.import.push(r);
      });
    }

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: CstNode) => {
        const child: ASTNodeDeclare = this.visit(element, err);
        if (child.vName in node.table) {
          // TODO: Error
          return;
        }
        node.table[child.vName] = {
          name: child.vName,
          type: 'variable',
          global: child.type === 'global',
          static: child.type === 'static',
        };
      });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: CstNode) => {
        const func: ASTNodeFunction = this.visit(element, err);
        if (func.fName in node.table) {
          // TODO: Error
          return;
        }
        // TODO: Override
        // FIXME: global/static
        node.table[func.fName] = {
          name: func.fName,
          type: 'function',
          global: false,
          static: false,
        };
      });
    }

    if (ctx.Statement) {
      ctx.Statement.forEach((s: CstNode) => {
        const n = this.visit(s, err);
        node.body.push(n);
      });
    }

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

  protected ImportStatement(ctx: NodeContext, err: ASTError[]): ASTNodeImport {
    const token: ASTNodeImport = {
      type: 'Import',
      start: ctx.IMPORT[0].startOffset,
      end: 0,
      package: ctx.Package.map((pkg: CstNode) => this.visit(pkg, err))[0].item,
    };
    if (ctx.alias && ctx.alias.length && ctx.alias.length === 1) {
      token.alias = (ctx.alias[0] as IToken).image;
    }
    if (
      zGlobal.isProject &&
      !get(zGlobal.packages, token.package) &&
      !get(zGlobal.directory, token.package)
    ) {
      err.push({
        start: token.start,
        end: ctx.SEMICOLON[0].endOffset,
        info: 'Unknown package',
        message: 'Unknown package: ' + token.package.join('.'),
      });
    }
    return token;
  }

  protected GlobalStaticDeclaration(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeDeclare {
    const node: ASTNodeDeclare = {
      type: ctx.GLOBAL_ZS ? 'global' : 'static',
      start: -1,
      end: -1,
      vName: (ctx.vName[0] as IToken).image,
      vType: ctx.vType
        ? this.zsVisit(ctx.vType, err)
        : {
            type: 'any',
            start: -1,
            end: -1,
          },
      value: this.zsVisit(ctx.value, err),
    };

    node.start = ctx.GLOBAL_ZS
      ? ctx.GLOBAL_ZS[0].startOffset
      : ctx.STATIC[0].startOffset;
    node.end = node.value.end;

    return node;
  }

  protected FunctionDeclaration(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeFunction {
    const funcName = ctx.FunctionName[0] as IToken;
    const node: ASTNodeFunction = {
      type: 'function',
      start: funcName.startOffset,
      end: -1, // TODO
      fName: funcName.image,
      fPara: ctx.ParameterList
        ? this.zsVisit<ASTNodeParams>(ctx.ParameterList, err).params
        : [],
      fType: ctx.TypeDeclare ? this.zsVisit(ctx.TypeDeclare, err) : 'any',
      fBody: this.zsVisit(ctx.StatementBody, err),
    };

    return node;
  }

  protected ZenClassDeclaration(ctx: NodeContext, err: ASTError[]): ASTNode {
    // TODO
    return {
      type: 'zenclass',
      start: 0,
      end: 0,
    };
  }

  protected BlockStatement(ctx: NodeContext, err: ASTError[]): ASTNode {
    const node: ASTNode = {
      type: 'BlockStatement',
      start: 0,
      end: 0,
    };
    ctx.Statement.forEach((s: CstNode) => {
      // TODO
      const n: ASTNode = this.visit(s, err);
    });

    return node;
  }

  /**
   * Level 3
   * =================================================================================================
   */

  protected StatementBody(ctx: NodeContext, err: ASTError[]): ASTNode {
    const node: ASTNode = {
      type: 'StatementBody',
      start: 0,
      end: 0,
    };

    // TODO
    if (ctx.BlockStatement) {
      const n = this.zsVisit(ctx.BlockStatement, err);
    }

    return node;
  }

  /**
   * Single statement
   */
  protected Statement(ctx: NodeContext, err: ASTError[]): ASTNode {
    return this.zsVisit(ctx.component, err);
  }

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeReturnStatement {
    const node: ASTNodeReturnStatement = {
      type: 'ReturnStatement',
      start: -1, // TODO: position
      end: -1,
      argument: null,
    };

    if (ctx.Expression) {
      node.argument = this.zsVisit(ctx.Expression, err);
    }

    return node;
  }

  protected DeclareStatement(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeDeclaration {
    const name = ctx.declare_name[0] as IToken;
    const node: ASTNodeDeclaration = {
      type: 'VariableDeclaration',
      start: 0,
      end: 0,
      id: {
        type: 'Identifier',
        start: name.startOffset,
        end: name.endOffset,
        name: name.image,
      },
      kind: (ctx.declare_kind[0] as IToken).image as 'let' | 'const',
    };

    if (ctx.declare_init) {
      node.init = this.zsVisit(ctx.declare_init, err);
    }

    return node;
  }

  protected IfStatement(ctx: NodeContext, err: ASTError[]): ASTNodeIfStatement {
    const node: ASTNodeIfStatement = {
      type: 'IfStatement', // TODO: position
      start: -1,
      end: -1,
      test: this.zsVisit(ctx.AssignExpression, err),
      consequent: this.zsVisit(ctx.Statement[0], err),
    };

    if (ctx.Statement.length === 2) {
      node.alternate = this.zsVisit(ctx.Statement[1], err);
    }

    return node;
  }

  protected ForStatement(ctx: NodeContext, err: ASTError[]): ASTNode {
    // TODO
    return {
      type: 'for',
      start: 0,
      end: 0,
    };
  }

  protected WhileStatement(ctx: NodeContext, err: ASTError[]): ASTNode {
    // TODO
    return {
      type: 'while',
      start: 0,
      end: 0,
    };
  }

  protected VersionStatement(ctx: NodeContext, err: ASTError[]): ASTNode {
    // TODO
    return {
      type: 'version',
      start: 0,
      end: 0,
    };
  }

  protected BreakStatement(ctx: NodeContext, err: ASTError[]): ASTNode {
    // TODO
    return {
      type: 'break',
      start: 0,
      end: 0,
    };
  }

  protected ContinueStatement(ctx: NodeContext, err: ASTError[]): ASTNode {
    // TODO
    return {
      type: 'continue',
      start: 0,
      end: 0,
    };
  }

  protected ExpressionStatement(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeExpressionStatement {
    const node = this.zsVisit<ASTNodeAssignExpression>(ctx.Expression, err);
    return {
      type: 'ExpressionStatement',
      start: node.start,
      end: node.end,
      expression: node,
    };
  }

  /**
   * Level 5: Expressions
   * =================================================================================================
   */
  protected Expression(ctx: NodeContext, err: ASTError[]): ASTNode {
    return this.zsVisit(ctx.expression, err);
  }

  protected AssignExpression(ctx: NodeContext, err: ASTError[]): ASTNode {
    const lhs = this.zsVisit<ASTNodeConditionalExpression>(ctx.lhs, err);

    if (ctx.rhs) {
      const node: ASTNodeAssignExpression = {
        type: 'AssignExpression',
        start: 0,
        end: 0,
        lhs,
        operator: (ctx.operator[0] as IToken).image,
        rhs: this.zsVisit(ctx.rhs, err),
      };
      return node;
    } else {
      return lhs;
    }
  }

  protected UnaryExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeUnaryExpression | ASTNodePostfixExpression {
    const exp: ASTNodeUnaryExpression | ASTNodePostfixExpression = this.zsVisit(
      ctx.expression,
      err
    );

    if (ctx.operator) {
      return {
        type: 'UnaryExpression',
        start: exp.start, // FIXME
        end: exp.end,
        operator: (ctx.operator[0] as IToken).image,
        expression: exp,
      };
    } else {
      return exp;
    }
  }

  protected AddExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(
      ctx.operator,
      ctx.MultiplyExpression,
      err
    );
  }

  protected MultiplyExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.UnaryExpression, err);
  }

  protected CompareExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.AddExpression, err);
  }

  protected AndExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.CompareExpression, err);
  }

  protected AndAndExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.OrExpression, err);
  }

  protected OrExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.XorExpression, err);
  }

  protected OrOrExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.AndAndExpression, err);
  }

  protected XorExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.AndExpression, err);
  }

  protected ConditionalExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeConditionalExpression {
    const node: ASTNodeConditionalExpression = {
      type: 'ConditionalExpression',
      start: 0, // TODO: calculate start and end
      end: 0,

      condition: this.zsVisit(ctx.OrOrExpression[0], err),
    };

    // condition ? valid : invalid
    if (ctx.ConditionalExpression) {
      node.valid = this.zsVisit(ctx.OrOrExpression[1], err);
      node.invalid = this.zsVisit(ctx.ConditionalExpression, err);

      return node;
    } else {
      return node.condition;
    }
  }

  protected PostfixExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodePrimaryExpression | ASTNodePostfixExpression {
    const primary = this.zsVisit<ASTNodePrimaryExpression>(
      ctx.PrimaryExpression[0],
      err
    );

    let hasPostfix = false;
    const node: ASTNodePostfixExpression = {
      type: 'PostfixExpression',
      start: 0,
      end: 0,
      primary: primary,
    };

    if (ctx.PostfixExpressionMemberCall) {
      hasPostfix = true;
      // TODO
    }
    if (ctx.PostfixExpressionTo) {
      hasPostfix = true;
      // TODO
    }
    if (ctx.PostfixExpressionDotDot) {
      hasPostfix = true;
      // TODO
    }
    if (ctx.PostfixExpressionArray) {
      hasPostfix = true;
      // TODO
    }
    if (ctx.PostfixExpressionFunctionCall) {
      hasPostfix = true;
      // TODO
    }
    if (ctx.TypeDeclare) {
      hasPostfix = true;
      // TODO
    }
    if (ctx.instanceof) {
      hasPostfix = true;
      // TODO
    }

    if (hasPostfix) {
      return node;
    } else {
      return primary;
    }
  }

  protected PostfixExpressionMemberCall(ctx: NodeContext, err: ASTError[]) {}

  protected PostfixExpressionTo(ctx: NodeContext, err: ASTError[]) {}

  protected PostfixExpressionDotDot(ctx: NodeContext, err: ASTError[]) {}

  protected PostfixExpressionArray(ctx: NodeContext, err: ASTError[]) {}

  protected PostfixExpressionFunctionCall(ctx: NodeContext, err: ASTError[]) {}

  protected PrimaryExpression(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodePrimaryExpression {
    if (ctx.literal) {
      return {
        type: 'Literal',
        start: 0, // TODO
        end: 0,

        raw: (ctx.literal[0] as IToken).image,
        value: '',
      };
    } else if (ctx.identifier) {
      return {
        type: 'Identifier',
        start: 0, // TODO
        end: 0,

        name: (ctx.identifier[0] as IToken).image,
      };
    } else if (ctx.BracketHandler) {
      return this.zsVisit(ctx.BracketHandler[0], err) as ASTNodeBracketHandler;
    } else if (ctx.AssignExpression) {
      return this.zsVisit(
        ctx.AssignExpression[0],
        err
      ) as ASTNodeAssignExpression;
    } else if (ctx.ZSMap) {
      return this.zsVisit(ctx.ZSMap[0], err);
    } else if (ctx.ZSArray) {
      return this.zsVisit(ctx.ZSArray[0], err);
    }
  }

  /**
   * Level 6 Others
   * =================================================================================================
   */
  protected LambdaFunctionDeclaration(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNode {
    return {
      type: 'lambda-function',
      start: 0,
      end: 0,
    };
  }

  protected InBracket(ctx: NodeContext, err: ASTError[]): ASTNode {
    return this.zsVisit(ctx.AssignExpression, err);
  }

  protected BracketHandler(
    ctx: NodeContext,
    err: ASTError[]
  ): ASTNodeBracketHandler {
    const node: ASTNodeBracketHandler = {
      type: 'BracketHandler',
      items: ctx.$BracketHandlerItemGroup.map((item: CstNode) =>
        this.visit(item, err)
      ),
      start: ctx.LT[0].startOffset,
      end: ctx.GT[0].endOffset + 1,
    };

    // FIXME: <modid:item:meta:*> should be invalid
    let exist = false,
      items = node.items;
    if (items[items.length - 1] === '*') {
      items = items.slice(0, items.length - 1);
    }
    if (BracketHandlerMap.has(items[0])) {
      exist = BracketHandlerMap.get(items[0]).check(items);
    } else if (items[0] !== 'item') {
      exist = BracketHandlerMap.get('item').check(['item', ...items]);
    }
    if (!exist) {
      const error: ASTBracketHandlerError = {
        start: node.start,
        end: node.end,
        info: ERROR_BRACKET_HANDLER,
        message: `BracketHandler <${node.items.join(':')}> does not exist.`,
        isItem: items[0] === 'item',
      };
      err.push(error);
    }
    return node;
  }

  protected BracketHandler$BracketHandlerItemGroup(ctx: NodeContext) {
    return ctx.part.map((t: IToken) => t.image).join('');
  }

  protected ZSArray(ctx: NodeContext, err: ASTError[]): ASTNodeArray {
    const arr: ASTNode[] = [];
    if (ctx.AssignExpression) {
      ctx.AssignExpression.forEach((item: CstNode) => {
        arr.push(this.visit(item, err));
      });
    }

    return {
      type: 'array',
      array: arr,
      start: 0,
      end: 0,
    };
  }

  protected ZSMap(ctx: NodeContext, err: ASTError[]): ASTNodeMap {
    const map = new Map();

    if (ctx.ZSMapEntry) {
      ctx.ZSMapEntry.forEach((entry: CstNode) => {
        const e = this.visit(entry, err);
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
      end: 0,
    };
  }

  protected ZSMapEntry(ctx: NodeContext, err: ASTError[]) {
    return [this.zsVisit(ctx.KEY, err), this.zsVisit(ctx.VALUE, err)];
  }

  protected Package(ctx: NodeContext, err: ASTError[]): ASTNodePackage {
    const all: Array<IToken> = [];
    for (const k in ctx) {
      if (k === 'DOT') {
        continue;
      }
      all.push(...(ctx[k] as IToken[]));
    }
    all.sort((a, b) => a.startOffset - b.startOffset);
    return {
      type: 'package',
      item: all.map((t) => t.image),
      start: ctx.IDENTIFIER[0].startOffset,
      end: 0,
    };
  }

  protected ParameterList(ctx: NodeContext, err: ASTError[]): ASTNode {
    return {
      type: 'parameter-list',
      // item: ctx.Parameter.map((item: any) => this.visit(item)),
      start: 0,
      end: 0,
    };
  }

  protected Parameter(ctx: NodeContext, err: ASTError[]): ASTNode {
    return {
      type: 'parameter',
      // pName: ctx.IDENTIFIER[0].image,
      // pType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : undefined,
      start: 0,
      end: 0,
    };
  }

  protected TypeDeclare(ctx: NodeContext, err: ASTError[]) {
    return this.zsVisit(ctx.TypeAnnotation, err);
  }

  protected TypeAnnotation(ctx: NodeContext, err: ASTError[]): ASTNode {
    let type: ASTNode;

    // Imported type
    if (ctx.IDENTIFIER) {
      type = {
        type: 'IMPORT',
        start: ctx.IDENTIFIER[0].startOffset,
        end: 0,
        // item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      };
    }

    // Type from ANY - STRING
    if (Object.keys(ctx).length === 1) {
      type = {
        type: Object.keys(ctx)[0],
        start: 0,
        end: 0,
      };
    }

    // Function type
    if (ctx.FUNCTION) {
      type = {
        type: 'FUNCTION',
        // item: ctx.ParameterType.map((type: any) => this.visit(type)),
        start: ctx.FUNCTION[0].startOffset,
        end: 0,
        // return: this.visit(ctx.FunctionType),
      };
    }

    // Array type
    if (ctx.ArrayType) {
      const body = this.zsVisit(ctx.ArrayType, err);
      type = {
        type: 'ARRAY',
        start: body.start,
        end: 0,
        // item: body,
      };
    }

    if (ctx.SQBR_OPEN) {
      type = {
        type: 'A_ARRAY',
        start: 0,
        end: 0,
        // start: type.start,
        // level: ctx.SQBR_OPEN.length,
        // body: [type],
      };
    }

    return type;
  }
}

export const ZSInterpreter = new ZenScriptInterpreter();
