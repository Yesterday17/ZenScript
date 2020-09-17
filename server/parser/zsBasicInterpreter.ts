/* eslint-disable @typescript-eslint/no-unused-vars */
import { IToken, CstNode } from 'chevrotain';
import {
  ASTBasicProgram,
  ASTNodeDeclare,
  ASTNodeFunction,
  ASTNodeGlobalDeclare,
  ASTNodeZenClass,
  NodeContext,
} from '.';
import { ZSParser } from './zsParser';

/**
 * Basic Interpreter
 *
 * This interpreter translates CST to a simple AST.
 * This procedure costs little, so all scripts can be interpreted at startup.
 * At this step, global/static variables, function declarations and ZenClass declarations are dumped for `import` autocompletion.
 */
class ZenScriptBasicInterpreter extends ZSParser.getBaseCstVisitorConstructorWithDefaults() {
  constructor() {
    super();
    this.validateVisitor();
  }

  protected Program(ctx: NodeContext): ASTBasicProgram {
    const node: ASTBasicProgram = {
      scope: {},
    };

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: CstNode) => {
        const child: ASTNodeGlobalDeclare = this.visit(element);
        if (child.vName in node.scope) {
          // TODO: Error
          return;
        }
        node.scope[child.vName] = child.type;
      });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: CstNode) => {
        const func: ASTNodeFunction = this.visit(element);
        if (func.fName in node.scope) {
          // TODO: Error
          return;
        }
        node.scope[func.fName] = 'function';
      });
    }

    if (ctx.ZenClassDeclaration) {
      ctx.ZenClassDeclaration.forEach((element: CstNode) => {
        const clz: ASTNodeZenClass = this.visit(element);
        if (clz.cName in node.scope) {
          // TODO: Error
          return;
        }
        node.scope[clz.cName] = 'class';
      });
    }

    return node;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  protected GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    const declaration: ASTNodeDeclare = {
      type: 'global',
      start: -1,
      end: -1,
      vName: '',
      vType: 'any',

      errors: [],
    };

    declaration.type = ctx.GLOBAL_ZS ? 'global' : 'static';
    declaration.vName = (ctx.vName[0] as IToken).image;
    declaration.vType = ctx.vType ? this.visit(ctx.vType as CstNode[]) : 'any';
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
      end: -1,
      fName: (ctx.FunctionName[0] as IToken).image,
      fPara: ctx.ParameterList
        ? this.visit(ctx.ParameterList as CstNode[])
        : [],
      fType: ctx.TypeDeclare ? this.visit(ctx.TypeDeclare as CstNode[]) : 'any',
      fBody: this.visit(ctx.StatementBody as CstNode[]),
      errors: [],
    };
  }

  protected ZenClassDeclaration(ctx: NodeContext): ASTNodeZenClass {
    return {
      type: 'class',
      start: (ctx.ZEN_CLASS[0] as IToken).startOffset,
      end: -1,
      cName: (ctx.name[0] as IToken).image,
      errors: [],
    };
  }
}

export const ZSBasicInterpreter = new ZenScriptBasicInterpreter();
