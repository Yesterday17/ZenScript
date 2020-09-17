/* eslint-disable @typescript-eslint/ban-types */
import { CstElement, CstNode, IToken } from 'chevrotain';
import get from 'get-value';
import {
  ASTBody,
  ASTBracketHandlerError,
  ASTNode,
  ASTNodeArray,
  ASTNodeAssignExpression,
  ASTNodeBinaryExpression,
  ASTNodeBracketHandler,
  ASTNodeConditionalExpression,
  ASTNodeDeclare,
  ASTNodeExpressionStatement,
  ASTNodeFunction,
  ASTNodeImport,
  ASTNodeMap,
  ASTNodePackage,
  ASTNodePostfixExpression,
  ASTNodePrimaryExpression,
  ASTNodeProgram,
  ASTNodeUnaryExpression,
  NodeContext,
} from '.';
import { ERROR_BRACKET_HANDLER } from '../api/constants';
import { zGlobal } from '../api/global';
import { BracketHandlerMap } from '../completion/bracketHandler/bracketHandlers';
import { ZSParser } from './zsParser';

/**
 * Push a node to a parent.
 * @param node The parent node.
 * @param value The child node
 */
function pushBody(node: ASTBody, value: ASTNode): ASTNode {
  node.body.push(value);
  if (value.errors) {
    node.errors.push(...value.errors);
  }
  return node;
}

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

  parseBinaryExpression(
    operators: CstElement[],
    rules: CstElement[]
  ): ASTNodeBinaryExpression | ASTNode {
    const first: ASTNode = this.visit(rules[0] as CstNode);
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
      errors: [],
    };

    operators.forEach((op: IToken, i) => {
      root.operator = op.image;
      root.right = this.visit(rules[i + 1] as CstNode);

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
          errors: [],
        };
      }
    });

    return root;
  }

  protected Program(ctx: NodeContext): ASTNodeProgram {
    const node: ASTNodeProgram = {
      type: 'Program',
      import: [],
      start: 0,
      end: 0,
      body: [],
      subtables: [],
      table: {}, // Scope table
      errors: [],
    };

    if (ctx.ImportStatement) {
      ctx.ImportStatement.forEach((imp: CstNode) => {
        const r = this.visit(imp);
        node.errors.push(...r.errors);
        delete r.errors;
        node.import.push(r);
      });
    }

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: CstNode) => {
        const child: ASTNodeDeclare = this.visit(element);
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
        const func: ASTNodeFunction = this.visit(element);
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
        const n = this.visit(s);
        if (n.errors && n.errors.length > 0) {
          node.errors.push(...n.errors);
        }
        pushBody(node, n);
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

  protected ImportStatement(ctx: NodeContext): ASTNodeImport {
    const token: ASTNodeImport = {
      type: 'Import',
      start: ctx.IMPORT[0].startOffset,
      end: 0,
      package: ctx.Package.map((pkg: CstNode) => this.visit(pkg))[0].item,
      errors: [],
    };
    if (ctx.alias && ctx.alias.length && ctx.alias.length === 1) {
      token.alias = (ctx.alias[0] as IToken).image;
    }
    if (
      zGlobal.isProject &&
      !get(zGlobal.packages, token.package) &&
      !get(zGlobal.directory, token.package)
    ) {
      token.errors.push({
        start: token.start,
        end: ctx.SEMICOLON[0].endOffset,
        reason: 'Unknown package',
        detail: 'Unknown package: ' + token.package.join('.'),
      });
    }
    return token;
  }

  protected GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    const node: ASTNodeDeclare = {
      type: ctx.GLOBAL_ZS ? 'global' : 'static',
      start: -1,
      end: -1,
      vName: (ctx.vName[0] as IToken).image,
      vType: ctx.vType ? this.visit(ctx.vType as CstNode[]) : 'any',
      value: this.visit(ctx.value as CstNode[]),

      errors: [],
    };

    if (node.value.errors) {
      node.errors.push(...node.value.errors);
    }

    node.start = ctx.GLOBAL_ZS
      ? ctx.GLOBAL_ZS[0].startOffset
      : ctx.STATIC[0].startOffset;
    node.end = node.value.end;

    return node;
  }

  protected FunctionDeclaration(ctx: NodeContext): ASTNodeFunction {
    const funcName = ctx.FunctionName[0] as IToken;
    const node: ASTNodeFunction = {
      type: 'function',
      start: funcName.startOffset,
      end: -1, // TODO
      fName: funcName.image,
      fPara: ctx.ParameterList
        ? this.visit(ctx.ParameterList as CstNode[])
        : [],
      fType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare as CstNode[]) : 'any',
      fBody: this.visit(ctx.StatementBody as CstNode[]),
      errors: [],
    };

    if (node.fBody.errors) {
      node.errors.push(...node.fBody.errors);
    }

    return node;
  }

  protected ZenClassDeclaration(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'zenclass',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected BlockStatement(ctx: NodeContext): ASTNode {
    const node: ASTNode = {
      type: 'BlockStatement',
      start: 0,
      end: 0,
      errors: [],
    };
    ctx.Statement.forEach((s: CstNode) => {
      // TODO
      const n: ASTNode = this.visit(s);
      if (n.errors) {
        node.errors.push(...n.errors);
      }
    });

    return node;
  }

  /**
   * Level 3
   * =================================================================================================
   */

  protected StatementBody(ctx: NodeContext): ASTNode {
    const node: ASTNode = {
      type: 'StatementBody',
      start: 0,
      end: 0,
      errors: [],
    };

    // TODO
    if (ctx.BlockStatement) {
      const n: ASTNode = this.visit(ctx.BlockStatement as CstNode[]);
      if (n.errors) {
        node.errors.push(...n.errors);
      }
    }

    return node;
  }

  /**
   * Single statement
   */
  protected Statement(ctx: NodeContext): ASTNode {
    return this.visit(ctx.component as CstNode[]);
  }

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'return',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected DeclareStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'declare',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected IfStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'if',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected ForStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'for',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected WhileStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'while',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected VersionStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'version',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected BreakStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'break',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected ContinueStatement(ctx: NodeContext): ASTNode {
    // TODO
    return {
      type: 'continue',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected ExpressionStatement(ctx: NodeContext): ASTNodeExpressionStatement {
    const node = this.visit(ctx.Expression as CstNode[]);
    return {
      type: 'ExpressionStatement',
      start: node.start,
      end: node.end,
      expression: node,
      errors: node.errors,
    };
  }

  /**
   * Level 5: Expressions
   * =================================================================================================
   */
  protected Expression(ctx: NodeContext): ASTNode {
    const node = this.visit(ctx.expression as CstNode[]);
    if (!node.rhs) {
      node.type = 'Expression';
    }
    return node;
  }

  protected AssignExpression(ctx: NodeContext): ASTNodeAssignExpression {
    const node: ASTNodeAssignExpression = {
      type: 'AssignExpression',
      start: 0,
      end: 0,
      lhs: this.visit(ctx.lhs as CstNode[]),
      errors: [],
    };

    if (node.lhs.errors) {
      node.errors.push(...node.lhs.errors);
    }

    if (ctx.rhs) {
      node.operator = (ctx.operator[0] as IToken).image;
      node.rhs = this.visit(ctx.rhs as CstNode[]);
      if (node.rhs.errors) {
        node.errors.push(...node.lhs.errors);
      }
    }

    return node;
  }

  protected UnaryExpression(
    ctx: NodeContext
  ): ASTNodeUnaryExpression | ASTNodePostfixExpression {
    const exp: ASTNodeUnaryExpression | ASTNodePostfixExpression = this.visit(
      ctx.expression as CstNode[]
    );

    if (ctx.operator) {
      return {
        type: 'UnaryExpression',
        start: exp.start, // FIXME
        end: exp.end,
        operator: (ctx.operator[0] as IToken).image,
        expression: exp,
        errors: [],
      };
    } else {
      return exp;
    }
  }

  protected AddExpression(ctx: NodeContext): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.MultiplyExpression);
  }

  protected MultiplyExpression(
    ctx: NodeContext
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.UnaryExpression);
  }

  protected CompareExpression(
    ctx: NodeContext
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.AddExpression);
  }

  protected AndExpression(ctx: NodeContext): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.CompareExpression);
  }

  protected AndAndExpression(
    ctx: NodeContext
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.OrExpression);
  }

  protected OrExpression(ctx: NodeContext): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.XorExpression);
  }

  protected OrOrExpression(
    ctx: NodeContext
  ): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.AndAndExpression);
  }

  protected XorExpression(ctx: NodeContext): ASTNodeBinaryExpression | ASTNode {
    return this.parseBinaryExpression(ctx.operator, ctx.AndExpression);
  }

  protected ConditionalExpression(
    ctx: NodeContext
  ): ASTNodeConditionalExpression {
    const node: ASTNodeConditionalExpression = {
      type: 'ConditionalExpression',
      start: 0, // TODO: calculate start and end
      end: 0,
      errors: [],

      condition: this.visit(ctx.OrOrExpression[0] as CstNode),
    };
    if (node.condition.errors) {
      node.errors.push(...node.condition.errors);
    }

    // condition ? valid : invalid
    if (ctx.ConditionalExpression) {
      node.valid = this.visit(ctx.OrOrExpression[1] as CstNode);
      node.invalid = this.visit(ctx.ConditionalExpression as CstNode[]);

      if (node.valid.errors) {
        node.errors.push(...node.valid.errors);
      }
      if (node.invalid.errors) {
        node.errors.push(...node.invalid.errors);
      }
      return node;
    } else {
      return node.condition;
    }
  }

  protected PostfixExpression(ctx: NodeContext): ASTNodePostfixExpression {
    const primary = this.visit(ctx.PrimaryExpression[0] as CstNode);

    let hasPostfix = false;
    const node: ASTNodePostfixExpression = {
      type: 'PostfixExpression',
      start: 0,
      end: 0,
      errors: [],
      primary: primary,
    };

    if (node.primary.errors) {
      node.errors.push(...node.primary.errors);
    }

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

  protected PostfixExpressionMemberCall(ctx: NodeContext) {}

  protected PostfixExpressionTo(ctx: NodeContext) {}

  protected PostfixExpressionDotDot(ctx: NodeContext) {}

  protected PostfixExpressionArray(ctx: NodeContext) {}

  protected PostfixExpressionFunctionCall(ctx: NodeContext) {}

  protected PrimaryExpression(ctx: NodeContext): ASTNodePrimaryExpression {
    if (ctx.literal) {
      return {
        type: 'Literal',
        start: 0, // TODO
        end: 0,
        errors: [],

        raw: (ctx.literal[0] as IToken).image,
        value: '',
      };
    } else if (ctx.identifier) {
      return {
        type: 'Identifier',
        start: 0, // TODO
        end: 0,
        errors: [],

        name: (ctx.literal[0] as IToken).image,
      };
    } else if (ctx.BracketHandler) {
      return this.visit(
        ctx.BracketHandler[0] as CstNode
      ) as ASTNodeBracketHandler;
    } else if (ctx.AssignExpression) {
      return this.visit(
        ctx.AssignExpression[0] as CstNode
      ) as ASTNodeAssignExpression;
    } else if (ctx.ZSMap) {
      return this.visit(ctx.ZSMap[0] as CstNode);
    } else if (ctx.ZSArray) {
      return this.visit(ctx.ZSArray[0] as CstNode);
    }
  }

  /**
   * Level 6 Others
   * =================================================================================================
   */
  protected LambdaFunctionDeclaration(ctx: NodeContext): ASTNode {
    return {
      type: 'lambda-function',
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected InBracket(ctx: NodeContext): ASTNode {
    return this.visit(ctx.AssignExpression as CstNode[]);
  }

  protected BracketHandler(ctx: NodeContext): ASTNodeBracketHandler {
    const node: ASTNodeBracketHandler = {
      type: 'BracketHandler',
      items: ctx.$BracketHandlerItemGroup.map((item: CstNode) =>
        this.visit(item)
      ),
      start: ctx.LT[0].startOffset,
      end: ctx.GT[0].endOffset + 1,
      errors: [],
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
        reason: ERROR_BRACKET_HANDLER,
        detail: `BracketHandler <${node.items.join(':')}> does not exist.`,
        isItem: items[0] === 'item',
      };
      node.errors.push(error);
    }
    return node;
  }

  protected BracketHandler$BracketHandlerItemGroup(ctx: NodeContext) {
    return ctx.part.map((t: IToken) => t.image).join('');
  }

  protected ZSArray(ctx: NodeContext): ASTNodeArray {
    const arr: ASTNode[] = [];
    if (ctx.AssignExpression) {
      ctx.AssignExpression.forEach((item: CstNode) => {
        arr.push(this.visit(item));
      });
    }

    return {
      type: 'array',
      array: arr,
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected ZSMap(ctx: NodeContext): ASTNodeMap {
    const map = new Map();

    if (ctx.ZSMapEntry) {
      ctx.ZSMapEntry.forEach((entry: CstNode) => {
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
      end: 0,
      errors: [],
    };
  }

  protected ZSMapEntry(ctx: NodeContext) {
    return [
      this.visit(ctx.KEY as CstNode[]),
      this.visit(ctx.VALUE as CstNode[]),
    ];
  }

  protected Package(ctx: NodeContext): ASTNodePackage {
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
      errors: [],
    };
  }

  protected ParameterList(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter-list',
      // item: ctx.Parameter.map((item: any) => this.visit(item)),
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected Parameter(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter',
      // pName: ctx.IDENTIFIER[0].image,
      // pType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : undefined,
      start: 0,
      end: 0,
      errors: [],
    };
  }

  protected TypeDeclare(ctx: NodeContext) {
    return this.visit(ctx.TypeAnnotation as CstNode[]);
  }

  protected TypeAnnotation(ctx: NodeContext): ASTNode {
    let type: ASTNode;

    // Imported type
    if (ctx.IDENTIFIER) {
      type = {
        type: 'IMPORT',
        start: ctx.IDENTIFIER[0].startOffset,
        end: 0,
        errors: [],
        // item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      };
    }

    // Type from ANY - STRING
    if (Object.keys(ctx).length === 1) {
      type = {
        type: Object.keys(ctx)[0],
        start: 0,
        end: 0,
        errors: [],
      };
    }

    // Function type
    if (ctx.FUNCTION) {
      type = {
        type: 'FUNCTION',
        // item: ctx.ParameterType.map((type: any) => this.visit(type)),
        start: ctx.FUNCTION[0].startOffset,
        end: 0,
        errors: [],
        // return: this.visit(ctx.FunctionType),
      };
    }

    // Array type
    if (ctx.ArrayType) {
      const body: ASTNode = this.visit(ctx.ArrayType as CstNode[]);
      type = {
        type: 'ARRAY',
        start: body.start,
        end: 0,
        errors: [],
        // item: body,
      };
    }

    if (ctx.SQBR_OPEN) {
      type = {
        type: 'A_ARRAY',
        start: 0,
        end: 0,
        errors: [],
        // start: type.start,
        // level: ctx.SQBR_OPEN.length,
        // body: [type],
      };
    }

    return type;
  }
}

export const ZSInterpreter = new ZenScriptInterpreter();
