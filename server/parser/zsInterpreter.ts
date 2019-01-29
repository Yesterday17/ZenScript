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

class ZenScriptInterpreter extends ZSParser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  public Program(ctx: NodeContext): ASTNodeProgram {
    const program: ASTNodeProgram = {
      type: 'program',
      import: new Map(),
      global: new Map(),
      static: new Map(),
      function: new Map(),
    };

    if (ctx.ImportList) {
      program.import = this.visit(ctx.ImportList);
    }

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: any) => {
        const node: ASTNodeDeclare = this.visit(element);
        if (!program[node.type].has(node.vName)) {
          program[node.type].set(node.vName, node);
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
        } else {
          // TODO: Error
        }
      });
    }

    return program;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  public ImportList(ctx: NodeContext) {
    return ctx.Package.map((pkg: CstNode) => this.visit(pkg));
  }

  public GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    const declaration: ASTNodeDeclare = {
      type: 'global',
      vName: '',
      vType: 'any',
      value: undefined,
      errors: [],
    };

    declaration.type = ctx.GLOBAL_ZS ? 'global' : 'static';
    declaration.vName = ctx.vName[0].image;
    declaration.vType = ctx.vType ? this.visit(ctx.vType) : 'any';
    declaration.value = this.visit(ctx.value);

    if (declaration.errors.length === 0) {
      delete declaration.errors;
    }
    return declaration;
  }

  public FunctionDeclaration(ctx: NodeContext): ASTNodeFunction {
    return {
      type: 'function',
      fName: ctx.FunctionName[0].image,
      fPara: ctx.ParameterList ? this.visit(ctx.ParameterList) : [],
      fType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare) : 'any',
      fBody: this.visit(ctx.StatementBody),
    };
  }

  public BlockStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'block-statement',
    };
  }

  /**
   * Level 3
   * =================================================================================================
   */

  protected StatementBody(ctx: NodeContext): ASTNode {
    return {
      type: 'statement-body',
    };
  }

  /**
   * Single statement
   */
  protected Statement(ctx: NodeContext): ASTNode {
    return {
      type: 'statement',
    };
  }

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'return',
    };
  }

  protected DeclareStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'declare',
    };
  }

  protected IfStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'if',
    };
  }

  protected ForStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'for',
    };
  }

  protected WhileStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'while',
    };
  }

  protected VersionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'version',
    };
  }

  protected BreakStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'break',
    };
  }

  protected ExpressionStatement(ctx: NodeContext): ASTNode {
    return {
      type: 'expression-statement',
    };
  }

  /**
   * Level 5: Expressions
   * =================================================================================================
   */
  protected Expression(ctx: NodeContext): ASTNode {
    return {
      type: 'expression',
    };
  }

  protected AssignExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-assign',
    };
  }

  protected UnaryExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-unary',
    };
  }

  protected AddExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-add',
    };
  }

  protected MultiplyExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-mul',
    };
  }

  protected CompareExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-comp',
    };
  }

  protected AndExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-and',
    };
  }

  protected AndAndExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-andand',
    };
  }

  protected OrExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-or',
    };
  }

  protected OrOrExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-oror',
    };
  }

  protected XorExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-xor',
    };
  }

  protected ConditionalExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-cond',
    };
  }

  protected PostfixExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-post',
    };
  }

  protected PrimaryExpression(ctx: NodeContext): ASTNode {
    return {
      type: 'exp-primary',
    };
  }

  /**
   * Level 6 Others
   * =================================================================================================
   */
  protected LambdaFunctionDeclaration(ctx: NodeContext): ASTNode {
    return {
      type: 'lambda-function',
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
    };
  }

  // TODO: Debug
  protected BracketHandler$BracketHandlerItem(ctx: NodeContext) {
    return ctx[Object.keys(ctx)[0]].image;
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
    };
  }

  protected ParameterList(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter-list',
      item: ctx.Parameter.map((item: any) => this.visit(item)),
    };
  }

  protected Parameter(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter',
      pName: ctx.IDENTIFIER[0].image,
      pType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare[0]) : undefined,
    };
  }

  protected TypeDeclare(ctx: NodeContext) {
    return this.visit(ctx.TypeAnnotation);
  }

  protected TypeAnnotation(ctx: NodeContext): ASTNode {
    let type;

    // Imported type
    if (ctx.IDENTIFIER) {
      type = {
        type: 'IMPORT',
        item: ctx.IDENTIFIER.map((identifier: IToken) => identifier.image),
      };
    }

    // Type from ANY - STRING
    if (Object.keys(ctx).length === 1) {
      type = {
        type: Object.keys(ctx)[0],
      };
    }

    // Function type
    if (ctx.FUNCTION) {
      type = {
        type: 'FUNCTION',
        item: ctx.ParameterType.map((type: any) => this.visit(type)),
        return: this.visit(ctx.FunctionType),
      };
    }

    // Array type
    if (ctx.ArrayType) {
      type = {
        type: 'ARRAY',
        item: this.visit(ctx.ArrayType),
      };
    }

    if (ctx.SQBR_OPEN) {
      return {
        type: 'A_ARRAY',
        item: type,
        level: ctx.SQBR_OPEN.length,
      };
    }

    return type;
  }
}

export const ZSInterpreter = new ZenScriptInterpreter();
