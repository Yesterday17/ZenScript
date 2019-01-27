import { ZSParser } from './zsParser';
import {
  NodeContext,
  ASTNode,
  ASTNodePackage,
  ASTNodeProgram,
  ASTNodeDeclare,
} from '.';
import { CstNode, IToken } from 'chevrotain';

class ZenScriptInterpreter extends ZSParser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  public Program(ctx: NodeContext): ASTNodeProgram {
    const program: ASTNodeProgram = {
      type: 'program',
      import: [],
      global: [],
      static: [],
    };

    if (ctx.ImportList) {
      program.import = this.visit(ctx.ImportList);
    }

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: any) => {
        const node = this.visit(element);
        program[node.type].push(node);
      });
    }

    return program;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  public ImportList(ctx: NodeContext) {
    const packages = ctx.Package.map((pkg: CstNode) => this.visit(pkg));

    return packages;
  }

  public GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    const declaration: ASTNodeDeclare = {
      type: 'global',
      vName: '',
      vType: 'any',
      value: undefined,
    };

    declaration.type = ctx.GLOBAL_ZS ? 'global' : 'static';
    declaration.vName = ctx.vName[0].image;
    declaration.vType = ctx.vType ? this.visit(ctx.vType) : 'any';
    declaration.value = ctx.value ? this.visit(ctx.value) : undefined;

    return declaration;
  }

  public FunctionDeclaration(ctx: NodeContext): ASTNode {
    return {
      type: 'function',
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

  protected InBracket(ctx: NodeContext): ASTNode {
    return {
      type: 'inbracket',
    };
  }

  protected BracketHandler(ctx: NodeContext): ASTNode {
    return {
      type: 'bracket-handler',
    };
  }

  protected ZSArray(ctx: NodeContext): ASTNode {
    return {
      type: 'array',
    };
  }

  protected ZSMap(ctx: NodeContext): ASTNode {
    return {
      type: 'map',
    };
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
    };
  }

  protected Parameter(ctx: NodeContext): ASTNode {
    return {
      type: 'parameter',
    };
  }

  protected TypeDeclare(ctx: NodeContext): ASTNode {
    return {
      type: 'type-declare',
    };
  }

  protected TypeAnnotation(ctx: NodeContext): ASTNode {
    return {
      type: 'type',
    };
  }
}

export const ZSInterpreter = new ZenScriptInterpreter();
