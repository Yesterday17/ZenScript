/* eslint-disable @typescript-eslint/no-unused-vars */
import { IToken, CstNode, CstElement } from 'chevrotain';
import {
  ASTBasicProgram,
  ASTNodeDeclare,
  ASTNodeFunction,
  ASTNodeGlobalDeclare,
  ASTNodeZenClass,
  NodeContext,
  ASTNode,
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

  protected zsVisit<T extends ASTNode>(
    element: CstElement | CstNode | CstElement[] | CstNode[],
    position = false
  ): T {
    if (Array.isArray(element)) {
      element = element[0] as CstNode;
    } else {
      element = element as CstNode;
    }

    const node: T = this.visit(element as CstNode);

    if (position && element.location) {
      node.start = element.location.startOffset;
      node.end = element.location.endOffset;
    }

    return node;
  }

  protected Program(ctx: NodeContext): ASTBasicProgram {
    const program: ASTBasicProgram = {
      scope: {},
      error: [],
    };

    if (ctx.GlobalStaticDeclaration) {
      ctx.GlobalStaticDeclaration.forEach((element: CstNode) => {
        const child: ASTNodeGlobalDeclare = this.zsVisit(element, true);
        if (child.vName in program.scope) {
          program.error.push({
            start: child.start,
            end: child.end,
            info: 'Duplicated declaration',
            message: `${child.vName} already exists`,
          });
          return;
        }
        program.scope[child.vName] = child.type;
      });
    }

    if (ctx.FunctionDeclaration) {
      ctx.FunctionDeclaration.forEach((element: CstNode) => {
        const func: ASTNodeFunction = this.zsVisit(element, true);
        if (func.fName in program.scope) {
          program.error.push({
            start: func.start,
            end: func.end,
            info: 'Duplicated declaration',
            message: `Function ${func.fName} already exists`,
          });
          return;
        }
        program.scope[func.fName] = 'function';
      });
    }

    if (ctx.ZenClassDeclaration) {
      ctx.ZenClassDeclaration.forEach((element: CstNode) => {
        const clz: ASTNodeZenClass = this.zsVisit(element, true);
        if (clz.cName in program.scope) {
          program.error.push({
            start: clz.start,
            end: clz.end,
            info: 'Duplicated declaration',
            message: `ZenClass ${clz.cName} already exists`,
          });
          return;
        }
        program.scope[clz.cName] = 'class';
      });
    }

    return program;
  }

  /**
   * Level 2
   * =================================================================================================
   */

  protected GlobalStaticDeclaration(ctx: NodeContext): ASTNodeDeclare {
    return {
      type: ctx.GLOBAL_ZS ? 'global' : 'static',
      start: -1,
      end: -1,
      vName: (ctx.vName[0] as IToken).image,
      vType: {
        type: 'any',
        start: -1,
        end: -1,
        errors: [],
      },

      errors: [],
    };
  }

  protected FunctionDeclaration(ctx: NodeContext): ASTNodeFunction {
    return {
      type: 'function',
      start: -1,
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
      start: -1,
      end: -1,
      cName: (ctx.name[0] as IToken).image,
      errors: [],
    };
  }
}

export const ZSBasicInterpreter = new ZenScriptBasicInterpreter();
