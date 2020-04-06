import { IToken } from 'chevrotain';
import {
  ASTNode,
  ASTNodeDeclare,
  ASTNodeFunction,
  NodeContext,
  ASTBasicProgram,
  ASTNodeGlobalDeclare,
} from '.';
import { ZSParser } from './zsParser';

/**
 * Interpreter
 */
class ZenScriptBasicInterpreter extends ZSParser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  protected Program(ctx: NodeContext): ASTBasicProgram {
    const node: ASTBasicProgram = {
      scope: {},
    };

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: any) => {
        const child: ASTNodeGlobalDeclare = this.visit(element);
        if (child.vName in node.scope) {
          // TODO: Error
          return;
        }
        node.scope[child.vName] = child.type;
      });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: any) => {
        const func: ASTNodeFunction = this.visit(element);
        if (func.fName in node.scope) {
          // TODO: Error
          return;
        }
        node.scope[func.fName] = 'function';
      });
    }

    return node;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  protected ImportStatement(ctx: NodeContext) {}

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
    // declaration.value = this.visit(ctx.value);

    declaration.start = ctx.GLOBAL_ZS
      ? (ctx.GLOBAL_ZS[0] as IToken).startOffset
      : (ctx.STATIC[0] as IToken).startOffset;
    // declaration.end = declaration.value.end;

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

  protected BlockStatement(ctx: NodeContext) {}

  /**
   * Level 3
   * =================================================================================================
   */

  protected StatementBody(ctx: NodeContext) {}

  /**
   * Single statement
   */
  protected Statement(ctx: NodeContext) {}

  /**
   * Level 4: Statements
   * =================================================================================================
   */
  protected ReturnStatement(ctx: NodeContext) {}

  protected DeclareStatement(ctx: NodeContext) {}

  protected IfStatement(ctx: NodeContext) {}

  protected ForStatement(ctx: NodeContext) {}

  protected WhileStatement(ctx: NodeContext) {}

  protected VersionStatement(ctx: NodeContext) {}

  protected BreakStatement(ctx: NodeContext) {}

  protected ExpressionStatement(ctx: NodeContext) {}

  /**
   * Level 5: Expressions
   * =================================================================================================
   */
  protected Expression(ctx: NodeContext) {}

  protected AssignExpression(ctx: NodeContext) {}

  protected UnaryExpression(ctx: NodeContext) {}

  protected AddExpression(ctx: NodeContext) {}

  protected MultiplyExpression(ctx: NodeContext) {}

  protected CompareExpression(ctx: NodeContext) {}

  protected AndExpression(ctx: NodeContext) {}

  protected AndAndExpression(ctx: NodeContext) {}

  protected OrExpression(ctx: NodeContext) {}

  protected OrOrExpression(ctx: NodeContext) {}

  protected XorExpression(ctx: NodeContext) {}

  protected ConditionalExpression(ctx: NodeContext) {}

  protected PostfixExpression(ctx: NodeContext) {}

  protected PrimaryExpression(ctx: NodeContext) {}

  /**
   * Level 6 Others
   * =================================================================================================
   */
  protected LambdaFunctionDeclaration(ctx: NodeContext) {}

  protected InBracket(ctx: NodeContext) {}

  protected BracketHandler(ctx: NodeContext) {}

  protected BracketHandler$BracketHandlerItem(ctx: NodeContext) {}

  protected BracketHandler$BracketHandlerItemGroup(ctx: NodeContext) {}

  protected ZSArray(ctx: NodeContext) {}

  protected ZSMap(ctx: NodeContext) {}

  protected ZSMapEntry(ctx: NodeContext) {}

  protected Package(ctx: NodeContext) {}

  protected ParameterList(ctx: NodeContext) {}

  protected Parameter(ctx: NodeContext) {}

  protected TypeDeclare(ctx: NodeContext) {}

  protected TypeAnnotation(ctx: NodeContext) {}
}

export const ZSBasicInterpreter = new ZenScriptBasicInterpreter();
