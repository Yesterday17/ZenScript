import { CstNode, IToken } from 'chevrotain';
import get from 'get-value';
import {
  ASTBody,
  ASTNode,
  ASTNodeAddExpression,
  ASTNodeAndAndExpression,
  ASTNodeAndExpression,
  ASTNodeArray,
  ASTNodeAssignExpression,
  ASTNodeBracketHandler,
  ASTNodeCompareExpression,
  ASTNodeConditionalExpression,
  ASTNodeDeclare,
  ASTNodeExpressionStatement,
  ASTNodeFunction,
  ASTNodeMap,
  ASTNodeMultiplyExpression,
  ASTNodeOrExpression,
  ASTNodeOrOrExpression,
  ASTNodePackage,
  ASTNodePostfixExpression,
  ASTNodePrimaryExpression,
  ASTNodeProgram,
  ASTNodeUnaryExpression,
  ASTNodeXorExpression,
  NodeContext,
} from '.';
import { ERROR_BRACKET_HANDLER } from '../api/constants';
import { zGlobal } from '../api/global';
import { BracketHandlerMap } from '../completion/bracketHandler/bracketHandlers';
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

  protected Program(ctx: NodeContext): ASTNodeProgram {
    const node: ASTNodeProgram = {
      type: 'Program',
      import: [],
      start: 0,
      body: [],
      subtables: [],
      table: {}, // Scope table
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
      ctx.GlobalStaticDeclaration.forEach((element: any) => {
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
        pushBody(node, child);
      });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: any) => {
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
        pushBody(node, func);
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

    // sortBody(node);

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
    if (
      zGlobal.isProject &&
      !get(zGlobal.packages, token.package) &&
      !get(zGlobal.directory, token.package)
    ) {
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
    const node: ASTNodeFunction = {
      type: 'function',
      start: (ctx.FunctionName[0] as IToken).startOffset,
      fName: ctx.FunctionName[0].image,
      fPara: ctx.ParameterList ? this.visit(ctx.ParameterList[0]) : [],
      fType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : 'any',
      fBody: this.visit(ctx.StatementBody[0]),
      errors: [],
    };

    if (node.fBody.errors) {
      node.errors.push(...node.fBody.errors);
    }

    return node;
  }

  protected ZenClassDeclaration(ctx: NodeContext): ASTNode {
    return {
      type: 'zenclass',
      start: 0,
      errors: [],
    };
  }

  protected BlockStatement(ctx: NodeContext): ASTNode {
    const node: ASTNode = {
      type: 'BlockStatement',
      start: 0,
      errors: [],
    };
    ctx.Statement.forEach((s: any) => {
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
      errors: [],
    };

    // TODO
    if (ctx.BlockStatement) {
      const n: ASTNode = this.visit(ctx.BlockStatement[0]);
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
    return this.visit(ctx.component[0]);
  }

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'return',
      start: 0,
      errors: [],
    };
  }

  protected DeclareStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'declare',
      start: 0,
      errors: [],
    };
  }

  protected IfStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'if',
      start: 0,
      errors: [],
    };
  }

  protected ForStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'for',
      start: 0,
      errors: [],
    };
  }

  protected WhileStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'while',
      start: 0,
      errors: [],
    };
  }

  protected VersionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'version',
      start: 0,
      errors: [],
    };
  }

  protected BreakStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'break',
      start: 0,
      errors: [],
    };
  }

  protected ExpressionStatement(ctx: NodeContext): ASTNodeExpressionStatement {
    const node = this.visit(ctx.Expression[0]);
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
    const node = this.visit(ctx.expression[0]);
    if (!node.rhs) {
      node.type = 'Expression';
    }
    return node;
  }

  protected AssignExpression(ctx: NodeContext): ASTNodeAssignExpression {
    const node: ASTNodeAssignExpression = {
      type: 'AssignExpression',
      start: 0,
      lhs: this.visit(ctx.lhs[0]),
      errors: [],
    };

    if (node.lhs.errors) {
      node.errors.push(...node.lhs.errors);
    }

    if (ctx.rhs) {
      node.operator = ctx.operator[0].image;
      node.rhs = this.visit(ctx.rhs[0]);
      if (node.rhs.errors) {
        node.errors.push(...node.lhs.errors);
      }
    }

    return node;
  }

  protected UnaryExpression(ctx: NodeContext): ASTNodeUnaryExpression {
    const node: ASTNodeUnaryExpression = {
      type: 'UnaryExpression',
      start: 0,
      expression: this.visit(ctx.expression[0]),
      errors: [],
    };

    if (ctx.operator) {
      node.operator = ctx.operator[0].image;
    }

    if (node.expression.errors) {
      node.errors.push(...node.expression.errors);
    }

    return node;
  }

  protected AddExpression(ctx: NodeContext): ASTNodeAddExpression {
    const node: ASTNodeAddExpression = {
      type: 'AddExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(
        ctx.MultiplyExpression[ctx.MultiplyExpression.length - 1]
      ),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.MultiplyExpression.length > 1) {
      for (let offset = 1; offset < ctx.MultiplyExpression.length; offset++) {
        now.operator = ctx.operator[ctx.operator.length - offset].image;
        now.lhs = {
          type: 'AddExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.MultiplyExpression[ctx.MultiplyExpression.length - offset - 1]
          ),
        };
        if (node.rhs.errors) {
          node.errors.push(...node.rhs.errors);
        }
        if (offset === ctx.MultiplyExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }
    return node;
  }

  protected MultiplyExpression(ctx: NodeContext): ASTNodeMultiplyExpression {
    const node: ASTNodeMultiplyExpression = {
      type: 'MultiplyExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(ctx.UnaryExpression[ctx.UnaryExpression.length - 1]),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.UnaryExpression.length > 1) {
      for (let offset = 1; offset < ctx.UnaryExpression.length; offset++) {
        now.operator = ctx.operator[ctx.operator.length - offset].image;
        now.lhs = {
          type: 'MultiplyExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.UnaryExpression[ctx.UnaryExpression.length - offset - 1]
          ),
        };
        if (now.rhs.errors) {
          node.errors.push(...now.rhs.errors);
        }
        if (offset === ctx.UnaryExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }

    return node;
  }

  protected CompareExpression(ctx: NodeContext): ASTNodeCompareExpression {
    const node: ASTNodeCompareExpression = {
      type: 'CompareExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: this.visit(ctx.AddExpression[0]),
      operator: ctx.operator ? ctx.operator[0] : '',
      rhs:
        ctx.AddExpression.length > 1
          ? this.visit(ctx.AddExpression[1])
          : undefined,
    };
    if (node.lhs.errors) {
      node.errors.push(...node.lhs.errors);
    }
    if (node.rhs && node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    return node;
  }

  protected AndExpression(ctx: NodeContext): ASTNodeAndExpression {
    const node: ASTNodeAndExpression = {
      type: 'AndExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(ctx.CompareExpression[ctx.CompareExpression.length - 1]),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.CompareExpression.length > 1) {
      for (let offset = 1; offset < ctx.CompareExpression.length; offset++) {
        now.lhs = {
          type: 'AndExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.CompareExpression[ctx.CompareExpression.length - offset - 1]
          ),
        };
        if (now.rhs.errors) {
          node.errors.push(...now.rhs.errors);
        }
        if (offset === ctx.CompareExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }

    return node;
  }

  protected AndAndExpression(ctx: NodeContext): ASTNodeAndAndExpression {
    const node: ASTNodeAndAndExpression = {
      type: 'AndAndExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(ctx.OrExpression[ctx.OrExpression.length - 1]),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.OrExpression.length > 1) {
      for (let offset = 1; offset < ctx.OrExpression.length; offset++) {
        now.lhs = {
          type: 'AndAndExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.OrExpression[ctx.OrExpression.length - offset - 1]
          ),
        };
        if (now.rhs.errors) {
          node.errors.push(...now.rhs.errors);
        }
        if (offset === ctx.OrExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }

    return node;
  }

  protected OrExpression(ctx: NodeContext): ASTNodeOrExpression {
    const node: ASTNodeOrExpression = {
      type: 'OrExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(ctx.XorExpression[ctx.XorExpression.length - 1]),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.XorExpression.length > 1) {
      for (let offset = 1; offset < ctx.XorExpression.length; offset++) {
        now.lhs = {
          type: 'OrExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.XorExpression[ctx.XorExpression.length - offset - 1]
          ),
        };
        if (now.rhs.errors) {
          node.errors.push(...now.rhs.errors);
        }
        if (offset === ctx.XorExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }

    return node;
  }

  protected OrOrExpression(ctx: NodeContext): ASTNodeOrOrExpression {
    const node: ASTNodeOrOrExpression = {
      type: 'OrOrExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(ctx.AndAndExpression[ctx.AndAndExpression.length - 1]),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.AndAndExpression.length > 1) {
      for (let offset = 1; offset < ctx.AndAndExpression.length; offset++) {
        now.lhs = {
          type: 'OrOrExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.XorExpression[ctx.AndAndExpression.length - offset - 1]
          ),
        };
        if (now.rhs.errors) {
          node.errors.push(...now.rhs.errors);
        }
        if (offset === ctx.AndAndExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }

    return node;
  }

  protected XorExpression(ctx: NodeContext): ASTNodeXorExpression {
    const node: ASTNodeXorExpression = {
      type: 'XorExpression',
      start: 0, // TODO
      end: 0,
      errors: [],

      lhs: undefined,
      rhs: this.visit(ctx.AndExpression[ctx.AndExpression.length - 1]),
    };
    if (node.rhs.errors) {
      node.errors.push(...node.rhs.errors);
    }

    let now = node;
    if (ctx.AndExpression.length > 1) {
      for (let offset = 1; offset < ctx.AndExpression.length; offset++) {
        now.lhs = {
          type: 'XorExpression',
          start: 0, // TODO
          end: 0,
          errors: [],

          lhs: undefined,
          rhs: this.visit(
            ctx.XorExpression[ctx.AndExpression.length - offset - 1]
          ),
        };
        if (now.rhs.errors) {
          node.errors.push(...now.rhs.errors);
        }
        if (offset === ctx.AndExpression.length - 1) {
          now.lhs = now.lhs.rhs;
        } else {
          now = now.lhs;
        }
      }
    } else {
      node.lhs = node.rhs;
      delete node.rhs;
    }

    return node;
  }

  protected ConditionalExpression(
    ctx: NodeContext
  ): ASTNodeConditionalExpression {
    const node: ASTNodeConditionalExpression = {
      type: 'ConditionalExpression',
      start: 0, // TODO: calculate start and end
      end: 0,
      errors: [],

      condition: this.visit(ctx.OrOrExpression[0]),
    };
    if (node.condition.errors) {
      node.errors.push(...node.condition.errors);
    }

    // condition ? valid : invalid
    if (ctx.ConditionalExpression) {
      node.valid = this.visit(ctx.OrOrExpression[1]);
      node.invalid = this.visit(ctx.ConditionalExpression);

      if (node.valid.errors) {
        node.errors.push(...node.valid.errors);
      }
      if (node.invalid.errors) {
        node.errors.push(...node.invalid.errors);
      }
    }

    return node;
  }

  protected PostfixExpression(ctx: NodeContext): ASTNodePostfixExpression {
    const node: ASTNodePostfixExpression = {
      type: 'PostfixExpression',
      start: 0,
      errors: [],
      primary: this.visit(ctx.PrimaryExpression[0]),
    };

    if (node.primary.errors) {
      node.errors.push(...node.primary.errors);
    }

    if (ctx.property) {
      //
    } else if (ctx.to) {
      // TODO
      const to: ASTNodeAssignExpression = this.visit(ctx.to[0]);
      if (to.errors) {
        node.errors.push(...to.errors);
      }
    } else if (ctx.dotdot) {
      // TODO
      const dotdot: ASTNodeAssignExpression = this.visit(ctx.dotdot[0]);
      if (dotdot.errors) {
        node.errors.push(...dotdot.errors);
      }
    } else if (ctx.index) {
      //
      if (ctx.indexAssign) {
        // TODO
        const assign: ASTNodeAssignExpression = this.visit(ctx.indexAssign[0]);
        if (assign.errors) {
          node.errors.push(...assign.errors);
        }
      }
    } else if (ctx.brExpressions) {
      // TODO
      ctx.brExpressions.forEach((e: any) => {
        const exp: ASTNodeAssignExpression = this.visit(e);
        if (exp.errors) {
          node.errors.push(...exp.errors);
        }
      });
    } else if (ctx.type) {
      //
    } else if (ctx.instanceof) {
      //
    }

    return node;
  }

  protected PrimaryExpression(ctx: NodeContext): ASTNodePrimaryExpression {
    if (ctx.literal) {
      return {
        type: 'Literal',
        start: 0, // TODO
        end: 0,
        errors: [],

        raw: ctx.literal[0].image,
        value: '',
      };
    } else if (ctx.BracketHandler) {
      return this.visit(ctx.BracketHandler[0]) as ASTNodeBracketHandler;
    } else if (ctx.AssignExpression) {
      return this.visit(ctx.AssignExpression[0]) as ASTNodeAssignExpression;
    } else {
      // TODO
      return {
        type: 'Literal',
        start: 0, // TODO
        end: 0,
        errors: [],

        raw: '',
        value: '',
      };
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
      errors: [],
    };
  }

  protected InBracket(ctx: NodeContext): ASTNode {
    return this.visit(ctx.AssignExpression);
  }

  protected BracketHandler(ctx: NodeContext): ASTNodeBracketHandler {
    const node: ASTNodeBracketHandler = {
      type: 'BracketHandler',
      items: ctx.$BracketHandlerItemGroup.map((item: any) => this.visit(item)),
      start: (ctx.LT[0] as IToken).startOffset,
      end: (ctx.GT[0] as IToken).endOffset + 1,
      errors: [],
    };

    let exist = false;
    if (BracketHandlerMap.has(node.items[0])) {
      exist = BracketHandlerMap.get(node.items[0]).check(node.items);
    } else if (node.items[0] !== 'item') {
      exist = BracketHandlerMap.get('item').check(['item', ...node.items]);
    }
    if (!exist) {
      node.errors = [
        {
          start: node.start,
          end: node.end,
          reason: ERROR_BRACKET_HANDLER,
          detail: `BracketHandler <${node.items.join(':')}> does not exist.`,
        },
      ];
    }
    return node;
  }

  protected BracketHandler$BracketHandlerItemGroup(ctx: NodeContext) {
    return ctx.part[0].image;
  }

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
      errors: [],
    };
  }

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
      errors: [],
    };
  }

  protected ZSMapEntry(ctx: NodeContext) {
    return [this.visit(ctx.KEY), this.visit(ctx.VALUE)];
  }

  protected Package(ctx: NodeContext): ASTNodePackage {
    const all: Array<IToken> = [];
    for (const k in ctx) {
      if (k === 'DOT') {
        continue;
      }
      all.push(...ctx[k]);
    }
    all.sort((a, b) => a.startOffset - b.startOffset);
    return {
      type: 'package',
      item: all.map((t) => t.image),
      start: (ctx.IDENTIFIER[0] as IToken).startOffset,
      errors: [],
    };
  }

  protected ParameterList(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter-list',
      // item: ctx.Parameter.map((item: any) => this.visit(item)),
      start: 0,
      errors: [],
    };
  }

  protected Parameter(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter',
      // pName: ctx.IDENTIFIER[0].image,
      // pType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : undefined,
      start: 0,
      errors: [],
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
        errors: [],
        // item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      };
    }

    // Type from ANY - STRING
    if (Object.keys(ctx).length === 1) {
      type = {
        type: Object.keys(ctx)[0],
        start: 0,
        errors: [],
      };
    }

    // Function type
    if (ctx.FUNCTION) {
      type = {
        type: 'FUNCTION',
        // item: ctx.ParameterType.map((type: any) => this.visit(type)),
        start: (ctx.FUNCTION[0] as IToken).startOffset,
        errors: [],
        // return: this.visit(ctx.FunctionType),
      };
    }

    // Array type
    if (ctx.ArrayType) {
      const body: ASTNode = this.visit(ctx.ArrayType);
      type = {
        type: 'ARRAY',
        start: body.start,
        errors: [],
        // item: body,
      };
    }

    if (ctx.SQBR_OPEN) {
      type = {
        type: 'A_ARRAY',
        start: 0,
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
