import { CstParser, IToken, CstNode } from 'chevrotain';
import { ZenCodeAllTokens } from './lexer';
import * as tokens from './lexer';

class ZenCodeParser extends CstParser {
  constructor() {
    super(ZenCodeAllTokens, { maxLookahead: 1 });
    this.performSelfAnalysis();
  }

  parse(input: IToken[]): CstNode {
    this.input = input;
    return this.ZenCodeFile();
  }

  protected ZenCodeFile = this.RULE('ZenCodeFile', () => {
    this.MANY(() => {
      this.MANY2(() => {
        this.SUBRULE(this.Annotation);
      });
      this.MANY3(() => {
        this.SUBRULE(this.Modifier);
      });
      this.MANY4(() => {
        this.OR([
          {
            ALT: () => {
              this.CONSUME(tokens.K_IMPORT);
              this.SUBRULE(this.Import);
            },
          },
          {
            ALT: () => this.SUBRULE(this.Definition),
          },
          {
            GATE: () =>
              this.LA(1).tokenType !== tokens.K_FUNCTION ||
              this.LA(2).tokenType !== tokens.T_IDENTIFIER,
            ALT: () => this.SUBRULE(this.Statement),
          },
        ]);
      });
    });
  });

  protected Modifier = this.RULE('Modifier', () => {
    this.OR([
      {
        ALT: () => this.CONSUME(tokens.K_PUBLIC, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_PRIVATE, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_INTERNAL, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_EXTERN, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_ABSTRACT, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_FINAL, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_PROTECTED, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_IMPLICIT, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_VIRTUAL, { LABEL: 'modifier' }),
      },
    ]);
  });

  protected Import = this.RULE('Import', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_DOT, { LABEL: 'relative' });
    });

    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_DOT,
      DEF: () => {
        this.CONSUME(tokens.T_IDENTIFIER, {
          ERR_MSG: 'identifier expected',
          LABEL: 'importName',
        });
      },
    });

    this.OPTION2(() => {
      this.CONSUME(tokens.K_AS);
      this.CONSUME2(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'rename',
      });
    });
    this.CONSUME(tokens.T_SEMICOLON);
  });

  protected Annotation = this.RULE('Annotation', () => {
    this.CONSUME(tokens.T_SQOPEN);
    this.SUBRULE(this.Type);
    this.SUBRULE(this.CallArgumentsAnnotation);
    this.CONSUME(tokens.T_SQCLOSE, { ERR_MSG: '] expected' });
  });

  protected CallArguments = this.RULE('CallArguments', () => {
    this.SUBRULE(this.TypeArguments);
    this.CONSUME(tokens.T_BROPEN, { ERR_MSG: '( expected' });
    this.MANY_SEP({
      SEP: tokens.T_COMMA,
      DEF: () => {
        this.SUBRULE(this.Expression);
      },
    });
    this.CONSUME(tokens.T_BRCLOSE, { ERR_MSG: ') expected' });
  });

  protected CallArgumentsAnnotation = this.RULE(
    'CallArgumentsAnnotation',
    () => {
      this.SUBRULE(this.TypeArguments);
      this.OPTION(() => {
        this.CONSUME(tokens.T_BROPEN, { ERR_MSG: '( expected' });
        this.MANY_SEP({
          SEP: tokens.T_COMMA,
          DEF: () => {
            this.SUBRULE(this.Expression);
          },
        });
        this.CONSUME(tokens.T_BRCLOSE, { ERR_MSG: ') expected' });
      });
    }
  );

  protected TypeArguments = this.RULE('TypeArguments', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_LESS);
      this.AT_LEAST_ONE_SEP({
        SEP: tokens.T_COMMA,
        DEF: () => {
          this.SUBRULE(this.Type);
        },
      });
      this.CONSUME(tokens.T_GREATER, { ERR_MSG: '> expected' });
    });
  });

  ///////////////// Block Type /////////////////
  protected Type = this.RULE('Type', () => {
    this.SUBRULE(this.SingleType);
    this.MANY(() => {
      this.SUBRULE(this.TypeSuffix);
    });
  });

  protected TypeSuffix = this.RULE('TypeSuffix', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(tokens.T_DOT2);
          this.SUBRULE(this.Type);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.T_SQOPEN);
          this.MANY(() => {
            this.CONSUME(tokens.T_COMMA, { LABEL: 'dimension' });
          });

          this.OR2([
            {
              ALT: () => {
                this.CONSUME(tokens.T_LESS);
                this.SUBRULE(this.TypeParameter, { LABEL: 'genericMap' });
                this.CONSUME(tokens.T_GREATER, { ERR_MSG: '> expected' });
              },
            },
            {
              ALT: () => {
                this.SUBRULE2(this.Type, { LABEL: 'associative' });
              },
            },
          ]);
          this.CONSUME(tokens.T_SQCLOSE, { ERR_MSG: '] expected' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.T_QUEST, { LABEL: 'optional' });
        },
      },
    ]);
  });

  protected SingleType = this.RULE('SingleType', () => {
    this.OR([
      {
        ALT: () => this.CONSUME(tokens.K_VOID),
      },
      {
        ALT: () => this.CONSUME(tokens.K_BOOL),
      },
      {
        ALT: () => this.CONSUME(tokens.K_BYTE),
      },
      {
        ALT: () => this.CONSUME(tokens.K_SBYTE),
      },
      {
        ALT: () => this.CONSUME(tokens.K_SHORT),
      },
      {
        ALT: () => this.CONSUME(tokens.K_USHORT),
      },
      {
        ALT: () => this.CONSUME(tokens.K_INT),
      },
      {
        ALT: () => this.CONSUME(tokens.K_UINT),
      },
      {
        ALT: () => this.CONSUME(tokens.K_LONG),
      },
      {
        ALT: () => this.CONSUME(tokens.K_ULONG),
      },
      {
        ALT: () => this.CONSUME(tokens.K_USIZE),
      },
      {
        ALT: () => this.CONSUME(tokens.K_FLOAT),
      },
      {
        ALT: () => this.CONSUME(tokens.K_DOUBLE),
      },
      {
        ALT: () => this.CONSUME(tokens.K_CHAR),
      },
      {
        ALT: () => this.CONSUME(tokens.K_STRING),
      },
      {
        ALT: () => this.SUBRULE(this.FunctionType),
      },
      {
        ALT: () => this.SUBRULE(this.NamedType),
      },
    ]);
  });

  protected FunctionType = this.RULE('FunctionType', () => {
    this.CONSUME(tokens.K_FUNCTION);
    this.SUBRULE(this.FunctionHeader);
  });

  protected NamedType = this.RULE('NamedType', () => {
    this.MANY_SEP({
      SEP: tokens.T_DOT,
      DEF: () => {
        this.CONSUME(tokens.T_IDENTIFIER, {
          ERR_MSG: 'identifier expected',
          LABEL: 'namePart',
        });
        this.SUBRULE(this.TypeArguments, { LABEL: 'generic' });
      },
    });
  });

  protected FunctionHeader = this.RULE('FunctionHeader', () => {
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });

    this.CONSUME(tokens.T_BROPEN, { ERR_MSG: '( expected' });
    this.SUBRULE(this.FunctionHeaderParameters);
    this.CONSUME(tokens.T_BRCLOSE, { ERR_MSG: ') expected' });

    this.OPTION2(() => {
      this.OR([
        {
          ALT: () => this.CONSUME(tokens.K_AS),
        },
        {
          ALT: () => this.CONSUME(tokens.T_COLON),
        },
      ]);
      this.SUBRULE(this.Type, { LABEL: 'returnType' });
    });

    this.OPTION3(() => {
      this.CONSUME(tokens.K_THROWS);
      this.SUBRULE2(this.Type, { LABEL: 'thrownType' });
    });
  });

  protected TypeParameterList = this.RULE('TypeParameterList', () => {
    this.CONSUME(tokens.T_LESS);
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_COMMA,
      DEF: () => {
        this.SUBRULE(this.TypeParameter, { LABEL: 'typeParameter' });
      },
    });
    this.CONSUME(tokens.T_GREATER, { ERR_MSG: '> expected' });
  });

  protected TypeParameter = this.RULE('TypeParameter', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.MANY(() => {
      this.CONSUME(tokens.T_COLON);
      this.OPTION2(() => {
        this.CONSUME(tokens.K_SUPER, { LABEL: 'super' });
      });
      this.SUBRULE(this.Type);
    });
  });

  protected FunctionHeaderParameters = this.RULE(
    'FunctionHeaderParameters',
    () => {
      this.MANY_SEP({
        SEP: tokens.T_COMMA,
        DEF: () => {
          this.SUBRULE(this.FunctionHeaderParameter);
        },
      });
    }
  );

  protected FunctionHeaderParameter = this.RULE(
    'FunctionHeaderParameter',
    () => {
      this.MANY(() => {
        this.SUBRULE(this.Annotation);
      });
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'argName',
      });
      this.OPTION(() => {
        this.CONSUME(tokens.T_DOT3, { LABEL: 'variadic' });
      });
      this.OPTION2(() => {
        this.OR([
          {
            ALT: () => this.CONSUME(tokens.K_AS),
          },
          {
            ALT: () => this.CONSUME(tokens.T_COLON),
          },
        ]);
        this.SUBRULE(this.Type, { LABEL: 'type' });
      });
      this.OPTION3(() => {
        this.CONSUME(tokens.T_ASSIGN);
        this.SUBRULE(this.Expression, { LABEL: 'defaultValue' });
      });
    }
  );

  ///////////////// Block Definition /////////////////
  protected Definition = this.RULE('Definition', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(tokens.K_CLASS);
          this.SUBRULE(this.DefinitionClass);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_INTERFACE);
          this.SUBRULE(this.DefinitionInterface);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_ENUM);
          this.SUBRULE(this.DefinitionEnum);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_STRUCT);
          this.SUBRULE(this.DefinitionStruct);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_ALIAS);
          this.SUBRULE(this.DefinitionAlias);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_FUNCTION);
          this.SUBRULE(this.DefinitionFunction);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_EXPAND);
          this.SUBRULE(this.DefinitionExpansion);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_VARIANT);
          this.SUBRULE(this.DefinitionVariant);
        },
      },
    ]);
  });

  protected DefinitionClass = this.RULE('DefinitionClass', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });

    this.OPTION2(() => {
      this.CONSUME(tokens.T_COLON);
      this.SUBRULE(this.Type, { LABEL: 'superclass' });
    });

    this.CONSUME(tokens.T_AOPEN, { ERR_MSG: '{ expected' });
    this.MANY2(() => {
      this.SUBRULE(this.DefinitionMember, { LABEL: 'member' });
    });
    this.CONSUME(tokens.T_ACLOSE, { ERR_MSG: '} expected' });
  });

  protected DefinitionInterface = this.RULE('DefinitionInterface', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });

    this.OPTION2(() => {
      this.CONSUME(tokens.T_COLON);
      this.AT_LEAST_ONE_SEP({
        SEP: tokens.T_COMMA,
        DEF: () => {
          this.SUBRULE(this.Type, { LABEL: 'superInterface' });
        },
      });
    });

    this.CONSUME(tokens.T_AOPEN, { LABEL: '{ expected' });
    this.MANY2(() => {
      this.SUBRULE(this.DefinitionMember, { LABEL: 'member' });
    });
    this.CONSUME(tokens.T_ACLOSE, { ERR_MSG: '} expected' });
  });

  protected DefinitionEnum = this.RULE('DefinitionEnum', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });

    this.OPTION(() => {
      this.CONSUME(tokens.K_AS);
      this.SUBRULE(this.Type, { LABEL: 'asType' });
    });

    this.CONSUME(tokens.T_AOPEN, { LABEL: '{ expected' });
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_COMMA,
      DEF: () => {
        this.SUBRULE(this.EnumConstant, { LABEL: 'value' });
      },
    });

    this.OPTION2(() => {
      this.CONSUME(tokens.T_SEMICOLON);
      this.MANY2(() => {
        this.SUBRULE(this.DefinitionMember, { LABEL: 'member' });
      });
    });
    this.CONSUME(tokens.T_ACLOSE, { ERR_MSG: '} expected' });
  });

  protected DefinitionStruct = this.RULE('DefinitionStruct', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });

    this.CONSUME(tokens.T_AOPEN, { LABEL: '{ expected' });
    this.MANY(() => {
      this.SUBRULE(this.DefinitionMember, { LABEL: 'member' });
    });
    this.CONSUME(tokens.T_ACLOSE, { ERR_MSG: '} expected' });
  });

  protected DefinitionAlias = this.RULE('DefinitionAlias', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });
    this.CONSUME(tokens.K_AS);
    this.SUBRULE(this.Type, { LABEL: 'type' });
    this.CONSUME(tokens.T_SEMICOLON);
  });

  protected DefinitionFunction = this.RULE('DefinitionFunction', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.SUBRULE(this.FunctionHeader);
    this.SUBRULE(this.FunctionBody);
  });

  protected FunctionBody = this.RULE('FunctionBody', () => {
    this.OR([
      {
        ALT: () => this.SUBRULE(this.FunctionBodyNonEmpty),
      },
      {
        ALT: () => this.SUBRULE(this.FunctionEmptyBody),
      },
    ]);
  });

  protected FunctionBodyNonEmpty = this.RULE('FunctionBodyNonEmpty', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(tokens.T_LAMBDA);
          this.SUBRULE(this.FunctionLambdaBody);
        },
      },
      {
        ALT: () => this.SUBRULE(this.FunctionStatementBody),
      },
    ]);
  });

  protected FunctionLambdaBody = this.RULE('FunctionLambdaBody', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(tokens.T_AOPEN);
          this.MANY(() => {
            this.SUBRULE(this.Statement);
          });
          this.CONSUME(tokens.T_ACLOSE);
        },
      },
      {
        GATE: () => this.LA(1).tokenType !== tokens.T_AOPEN,
        ALT: () => {
          this.SUBRULE(this.Expression);
        },
      },
    ]);
  });

  protected FunctionEmptyBody = this.RULE('FunctionEmptyBody', () => {
    this.CONSUME(tokens.T_SEMICOLON);
  });

  protected FunctionStatementBody = this.RULE('FunctionStatementBody', () => {
    this.SUBRULE(this.StatementBlock);
  });

  protected DefinitionExpansion = this.RULE('DefinitionExpansion', () => {
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });
    this.SUBRULE(this.Type, { LABEL: 'target' });

    this.CONSUME(tokens.T_AOPEN, { LABEL: '{ expected' });
    this.MANY(() => {
      this.SUBRULE(this.DefinitionMember, { LABEL: 'member' });
    });
    this.CONSUME(tokens.T_ACLOSE);
  });

  protected DefinitionVariant = this.RULE('DefinitionVariant', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.SUBRULE(this.TypeParameterList);
    });
    this.CONSUME(tokens.T_AOPEN, { LABEL: '{ expected' });
    this.MANY(() => {
      this.SUBRULE(this.VariantOption);
    });
    this.OPTION2(() => {
      this.CONSUME(tokens.T_SEMICOLON);
      this.MANY2(() => {
        this.SUBRULE(this.DefinitionMember, { LABEL: 'member' });
      });
    });
    this.CONSUME(tokens.T_ACLOSE, { ERR_MSG: '} expected' });
  });

  protected VariantOption = this.RULE('VariantOption', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'optionName',
    });
    this.OPTION(() => {
      this.CONSUME(tokens.T_BROPEN);
      this.AT_LEAST_ONE_SEP({
        SEP: tokens.T_COMMA,
        DEF: () => {
          this.SUBRULE(this.Type, { LABEL: 'type' });
        },
      });
      this.CONSUME(tokens.T_BRCLOSE, { ERR_MSG: ') expected' });
    });
  });

  /////////////////
  protected EnumConstant = this.RULE('EnumConstant', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.CONSUME(tokens.T_BROPEN);
      this.AT_LEAST_ONE_SEP({
        SEP: tokens.T_COMMA,
        DEF: () => {
          this.SUBRULE(this.Expression, { LABEL: 'argument' });
        },
      });
      this.CONSUME(tokens.T_BRCLOSE, { ERR_MSG: ') expected' });
    });
    this.OPTION2(() => {
      this.CONSUME(tokens.T_ASSIGN);
      this.SUBRULE2(this.Expression, { LABEL: 'valueExpression' });
    });
  });

  ///////////////////////// Block Member /////////////////////////
  protected DefinitionMember = this.RULE('DefinitionMember', () => {
    this.MANY(() => {
      this.SUBRULE(this.Annotation);
    });
    this.MANY2(() => {
      this.SUBRULE(this.DefinitionModifier);
    });
    this.OR([
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(tokens.K_VAL) },
            { ALT: () => this.CONSUME(tokens.K_VAR) },
          ]);
          this.SUBRULE(this.FieldMember);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_THIS);
          this.SUBRULE(this.NonEmptyFunctionMember);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.T_IDENTIFIER);
          this.OR3([
            { ALT: () => this.SUBRULE(this.ConstMember) },
            { ALT: () => this.SUBRULE(this.FunctionMember) },
          ]);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_SET);
          this.SUBRULE(this.GetterSetterMember, { LABEL: 'SetterMember' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_GET);
          this.SUBRULE2(this.GetterSetterMember, { LABEL: 'GetterMember' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_IMPLEMENTS);
          this.SUBRULE(this.ImplementationMember);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.T_BROPEN);
          this.SUBRULE2(this.FunctionMember, { LABEL: 'CallerMember' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.T_SQOPEN);
          this.SUBRULE(this.IndexMember);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.T_CAT);
          this.CONSUME2(tokens.K_THIS);
          this.SUBRULE(this.FunctionBody, { LABEL: 'DestructorMember' });
        },
      },
      {
        ALT: () => {
          this.SUBRULE(this.Operator);
          this.SUBRULE3(this.FunctionMember, { LABEL: 'OperatorMember' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_AS);
          this.SUBRULE(this.CasterMember);
        },
      },
      {
        ALT: () => {
          this.OR4([
            {
              ALT: () => this.CONSUME(tokens.K_CLASS),
            },
            {
              ALT: () => this.CONSUME(tokens.K_INTERFACE),
            },
            {
              ALT: () => this.CONSUME(tokens.K_ALIAS),
            },
            {
              ALT: () => this.CONSUME(tokens.K_STRUCT),
            },
            {
              ALT: () => this.CONSUME(tokens.K_ENUM),
            },
          ]);
          this.SUBRULE(this.Definition, { LABEL: 'InnerDefinition' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_FOR);
          this.SUBRULE4(this.FunctionMember, { LABEL: 'IteratorMember' });
        },
      },
      {
        ALT: () => {
          this.SUBRULE(this.StatementBlock, {
            LABEL: 'StaticInitializerMember',
          });
        },
      },
    ]);
  });

  protected Operator = this.RULE('Operator', () => {
    this.OR([
      { ALT: () => this.CONSUME(tokens.T_ADD) },
      { ALT: () => this.CONSUME(tokens.T_SUB) },
      { ALT: () => this.CONSUME(tokens.T_MUL) },
      { ALT: () => this.CONSUME(tokens.T_DIV) },
      { ALT: () => this.CONSUME(tokens.T_MOD) },
      { ALT: () => this.CONSUME(tokens.T_AND) },
      { ALT: () => this.CONSUME(tokens.T_OR) },
      { ALT: () => this.CONSUME(tokens.T_XOR) },
      { ALT: () => this.CONSUME(tokens.T_NOT) },
      { ALT: () => this.CONSUME(tokens.T_ADDASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_SUBASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_CATASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_MULASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_DIVASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_MODASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_ANDASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_ORASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_XORASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_INCREMENT) },
      { ALT: () => this.CONSUME(tokens.T_DECREMENT) },
      { ALT: () => this.CONSUME(tokens.T_DOT2) },
      { ALT: () => this.CONSUME(tokens.T_SHL) },
      { ALT: () => this.CONSUME(tokens.T_SHR) },
      { ALT: () => this.CONSUME(tokens.T_USHR) },
      { ALT: () => this.CONSUME(tokens.T_SHLASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_SHRASSIGN) },
      { ALT: () => this.CONSUME(tokens.T_USHRASSIGN) },
    ]);
  });

  protected DefinitionModifier = this.RULE('DefinitionModifier', () => {
    this.OR([
      {
        ALT: () => this.CONSUME(tokens.K_INTERNAL, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_PUBLIC, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_PRIVATE, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_CONST, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_ABSTRACT, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_FINAL, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_STATIC, { LABEL: 'modifier' }),
      },

      {
        ALT: () => this.CONSUME(tokens.K_PROTECTED, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_EXTERN, { LABEL: 'modifier' }),
      },
      {
        ALT: () => this.CONSUME(tokens.K_OVERRIDE, { LABEL: 'modifier' }),
      },
    ]);
  });

  protected FieldMember = this.RULE('FieldMember', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.CONSUME(tokens.K_AS);
      this.SUBRULE(this.Type);
    });
    this.OPTION2({
      DEF: () => {
        this.CONSUME(tokens.T_COLON);
        this.SUBRULE(this.FieldAutoProp);
      },
    });
    this.OPTION3(() => {
      this.CONSUME(tokens.T_ASSIGN);
      this.SUBRULE(this.Expression);
    });
    this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected FieldAutoProp = this.RULE('FieldAutoProp', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_COMMA,
      DEF: () => {
        this.OPTION(() => {
          this.OR([
            { ALT: () => this.CONSUME(tokens.K_PUBLIC, { LABEL: 'public' }) },
            { ALT: () => this.CONSUME(tokens.K_PRIVATE, { LABEL: 'private' }) },
          ]);
        });
        this.OR2({
          DEF: [
            { ALT: () => this.CONSUME(tokens.K_GET, { LABEL: 'get' }) },
            { ALT: () => this.CONSUME(tokens.K_SET, { LABEL: 'set' }) },
          ],
          ERR_MSG: 'get or set expected',
        });
      },
    });
  });

  protected NonEmptyFunctionMember = this.RULE('NonEmptyFunctionMember', () => {
    this.SUBRULE(this.FunctionHeader);
    this.SUBRULE(this.FunctionBodyNonEmpty);
  });

  protected ConstMember = this.RULE('ConstMember', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.K_AS);
      this.SUBRULE(this.Type);
    });
    this.CONSUME(tokens.T_ASSIGN, { ERR_MSG: '= expected' });
    this.SUBRULE(this.Expression);
    this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected FunctionMember = this.RULE('FunctionMember', () => {
    this.SUBRULE(this.FunctionHeader);
    this.SUBRULE(this.FunctionBody);
  });

  protected GetterSetterMember = this.RULE('GetterSetterMember', () => {
    this.CONSUME(tokens.T_IDENTIFIER, {
      ERR_MSG: 'identifier expected',
      LABEL: 'name',
    });
    this.OPTION(() => {
      this.CONSUME(tokens.K_AS);
      this.SUBRULE(this.Type);
    });
    this.SUBRULE(this.FunctionBody);
  });

  protected ImplementationMember = this.RULE('ImplementationMember', () => {
    this.SUBRULE(this.Type);
    this.OR([
      { ALT: () => this.CONSUME(tokens.T_SEMICOLON) },
      {
        ALT: () => {
          this.CONSUME(tokens.T_AOPEN);
          this.MANY(() => {
            this.SUBRULE(this.DefinitionMember);
          });
          this.CONSUME(tokens.T_ACLOSE);
        },
      },
    ]);
  });

  protected IndexMember = this.RULE('IndexMember', () => {
    this.CONSUME(tokens.T_SQCLOSE, { ERR_MSG: '] expected' });
    this.OPTION(() => {
      this.CONSUME(tokens.T_ASSIGN, { LABEL: 'IndexSet' });
    });
    this.SUBRULE(this.FunctionMember);
  });

  protected CasterMember = this.RULE('CasterMember', () => {
    this.SUBRULE(this.Type);
    this.SUBRULE(this.FunctionBody);
  });

  // Block Statements
  protected Statement = this.RULE('Statement', () => {
    this.MANY(() => {
      this.SUBRULE(this.Annotation);
    });
    this.SUBRULE(this.StatementInner);
  });

  protected StatementInner = this.RULE('StatementInner', () => {
    this.OR({
      DEF: [
        {
          ALT: () => {
            this.SUBRULE(this.StatementBlock);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_RETURN);
            this.SUBRULE(this.StatementReturn);
          },
        },
        {
          ALT: () => {
            this.OR2([
              { ALT: () => this.CONSUME(tokens.K_VAL) },
              { ALT: () => this.CONSUME(tokens.K_VAR) },
            ]);
            this.SUBRULE(this.FieldMember, { LABEL: 'StatementVar' }); // FIXME: FieldMember is more than its syntax
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_IF);
            this.SUBRULE(this.StatementIf);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_FOR);
            this.SUBRULE(this.StatementFor);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_DO);
            this.SUBRULE(this.StatementDoWhile);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_WHILE);
            this.SUBRULE(this.StatementWhile);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_LOCK);
            this.SUBRULE(this.Expression);
            this.SUBRULE(this.Statement);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_THROW);
            this.SUBRULE2(this.Expression, { LABEL: 'StatementThrow' });
            this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
          },
        },
        {
          GATE: () => {
            const token = this.LA(2);
            return (
              token.tokenType !== tokens.T_QUEST &&
              token.tokenType !== tokens.T_NOT
            );
          },
          ALT: () => {
            this.CONSUME(tokens.K_TRY);
            this.SUBRULE(this.StatementTryCatch);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_CONTINUE);
            this.SUBRULE(this.StatementBreakContinue, {
              LABEL: 'StatementContinue',
            });
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_BREAK);
            this.SUBRULE2(this.StatementBreakContinue, {
              LABEL: 'StatementBreak',
            });
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_SWITCH);
            this.SUBRULE(this.StatementSwitch);
          },
        },
        {
          GATE: () => this.LA(1).tokenType !== tokens.T_AOPEN,
          ALT: () => {
            this.SUBRULE3(this.Expression);
            this.CONSUME2(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
          },
        },
      ],
    });
  });

  protected StatementBlock = this.RULE('StatementBlock', () => {
    this.CONSUME(tokens.T_AOPEN);
    this.MANY(() => {
      this.SUBRULE(this.StatementInner);
    });
    this.CONSUME(tokens.T_ACLOSE);
  });

  protected StatementReturn = this.RULE('StatementReturn', () => {
    this.OPTION(() => this.SUBRULE(this.Expression));
    this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected StatementIf = this.RULE('StatementIf', () => {
    this.SUBRULE(this.Expression);
    this.SUBRULE(this.Statement, { LABEL: 'onIf' });
    this.OPTION(() => {
      this.CONSUME(tokens.K_ELSE);
      this.SUBRULE2(this.Statement, { LABEL: 'onElse' });
    });
  });

  protected StatementFor = this.RULE('StatementFor', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_COMMA,
      DEF: () => {
        this.CONSUME(tokens.T_IDENTIFIER, {
          ERR_MSG: 'identifier expected',
          LABEL: 'name',
        });
      },
    });
    this.CONSUME(tokens.K_IN, { ERR_MSG: 'in expected' });
    this.SUBRULE(this.Expression);
    this.SUBRULE(this.Statement);
  });

  protected StatementDoWhile = this.RULE('StatementDoWhile', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_COLON);
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'label',
      });
    });
    this.SUBRULE(this.Statement);
    this.CONSUME(tokens.K_WHILE, { ERR_MSG: 'while expected' });
    this.SUBRULE(this.Expression);
    this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected StatementWhile = this.RULE('StatementWhile', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_COLON);
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'label',
      });
    });
    this.SUBRULE(this.Expression);
    this.SUBRULE(this.Statement);
  });

  protected StatementTryCatch = this.RULE('StatementTryCatch', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'name',
      });
      this.CONSUME(tokens.T_ASSIGN, { ERR_MSG: '= expected' });
      this.SUBRULE(this.Expression);
    });
    this.SUBRULE(this.Statement);
    this.MANY(() => {
      this.SUBRULE(this.CatchClause);
    });
    this.OPTION2(() => {
      this.CONSUME(tokens.K_FINALLY);
      this.SUBRULE2(this.Statement);
    });
  });

  private CatchClause = this.RULE('CatchClause', () => {
    this.CONSUME(tokens.K_CATCH);
    this.OPTION(() => {
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'catchName',
      });
    });
    this.OPTION2(() => {
      this.CONSUME(tokens.K_AS);
      this.SUBRULE(this.Type);
    });
    this.SUBRULE(this.Statement);
  });

  protected StatementBreakContinue = this.RULE('StatementBreakContinue', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'name',
      });
    });
    this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
  });

  protected StatementSwitch = this.RULE('StatementSwitch', () => {
    this.OPTION(() => {
      this.CONSUME(tokens.T_COLON);
      this.CONSUME(tokens.T_IDENTIFIER, {
        ERR_MSG: 'identifier expected',
        LABEL: 'name',
      });
    });
    this.CONSUME(tokens.T_AOPEN, { ERR_MSG: '{ expected' });
    this.MANY(() => {
      this.SUBRULE(this.SwitchCase);
    });
    this.CONSUME(tokens.T_ACLOSE);
  });

  private SwitchCase = this.RULE('SwitchCase', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(tokens.K_CASE);
          this.SUBRULE(this.Expression);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_DEFAULT);
        },
      },
    ]);
    this.CONSUME(tokens.T_COLON, { ERR_MSG: ': expected' });
    this.MANY(() => {
      this.SUBRULE(this.Statement);
    });
  });

  protected StatementExpression = this.RULE('StatementExpression', () => {
    this.SUBRULE(this.Expression);
    this.CONSUME(tokens.T_SEMICOLON, { ERR_MSG: '; expected' });
  });

  // Block Expressions
  protected Expression = this.RULE('Expression', () => {
    this.SUBRULE(this.ExpressionAssign);
  });

  protected ExpressionAssign = this.RULE('ExpressionAssign', () => {
    this.SUBRULE(this.ExpressionConditional);
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.T_ASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_ADDASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_SUBASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_CATASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_MULASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_DIVASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_MODASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_ORASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_ANDASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_XORASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_SHLASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_SHRASSIGN) },
        { ALT: () => this.CONSUME(tokens.T_USHRASSIGN) },
      ]);
      this.SUBRULE(this.ExpressionAssign);
    });
  });

  protected ExpressionConditional = this.RULE('ExpressionConditional', () => {
    this.SUBRULE(this.ExpressionOrOr);
    this.OPTION(() => {
      this.CONSUME(tokens.T_QUEST);
      this.SUBRULE2(this.ExpressionOrOr);
      this.CONSUME(tokens.T_COLON);
      this.SUBRULE(this.ExpressionConditional);
    });
  });

  protected ExpressionOrOr = this.RULE('ExpressionOrOr', () => {
    this.SUBRULE(this.ExpressionAndAnd);
    this.MANY(() => {
      this.CONSUME(tokens.T_OROR);
      this.SUBRULE2(this.ExpressionAndAnd);
    });
    this.MANY2(() => {
      this.CONSUME(tokens.T_COALESCE);
      this.SUBRULE3(this.ExpressionAndAnd);
    });
  });

  protected ExpressionAndAnd = this.RULE('ExpressionAndAnd', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_ANDAND,
      DEF: () => {
        this.SUBRULE(this.ExpressionOr);
      },
    });
  });

  protected ExpressionOr = this.RULE('ExpressionOr', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_OR,
      DEF: () => {
        this.SUBRULE(this.ExpressionXor);
      },
    });
  });

  protected ExpressionXor = this.RULE('ExpressionXor', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_XOR,
      DEF: () => {
        this.SUBRULE(this.ExpressionAnd);
      },
    });
  });

  protected ExpressionAnd = this.RULE('ExpressionAnd', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.T_AND,
      DEF: () => {
        this.SUBRULE(this.ExpressionCompare);
      },
    });
  });

  protected ExpressionCompare = this.RULE('ExpressionCompare', () => {
    this.SUBRULE(this.ExpressionShift);
    this.OR([
      {
        ALT: () => {
          this.OPTION(() => this.CONSUME(tokens.T_NOT));
          this.OR2([
            {
              ALT: () => {
                this.CONSUME(tokens.K_IS);
                this.SUBRULE(this.Type);
              },
            },
            {
              ALT: () => {
                this.CONSUME(tokens.K_IN);
                this.SUBRULE2(this.ExpressionShift);
              },
            },
          ]);
        },
      },
      {
        ALT: () => {
          this.OPTION2(() => {
            this.OR3([
              { ALT: () => this.CONSUME(tokens.T_EQUAL2) },
              { ALT: () => this.CONSUME(tokens.T_EQUAL3) },
              { ALT: () => this.CONSUME(tokens.T_NOTEQUAL) },
              { ALT: () => this.CONSUME(tokens.T_NOTEQUAL2) },
              { ALT: () => this.CONSUME(tokens.T_LESS) },
              { ALT: () => this.CONSUME(tokens.T_LESSEQ) },
              { ALT: () => this.CONSUME(tokens.T_GREATER) },
              { ALT: () => this.CONSUME(tokens.T_GREATEREQ) },
            ]);
            this.SUBRULE3(this.ExpressionShift);
          });
        },
      },
    ]);
  });

  protected ExpressionShift = this.RULE('ExpressionShift', () => {
    this.SUBRULE(this.ExpressionAdd);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.T_SHL) },
        { ALT: () => this.CONSUME(tokens.T_SHR) },
        { ALT: () => this.CONSUME(tokens.T_USHR) },
      ]);
      this.SUBRULE2(this.ExpressionAdd);
    });
  });

  protected ExpressionAdd = this.RULE('ExpressionAdd', () => {
    this.SUBRULE(this.ExpressionMul);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.T_ADD) },
        { ALT: () => this.CONSUME(tokens.T_SUB) },
        { ALT: () => this.CONSUME(tokens.T_CAT) },
      ]);
      this.SUBRULE2(this.ExpressionMul);
    });
  });

  protected ExpressionMul = this.RULE('ExpressionMul', () => {
    this.SUBRULE(this.ExpressionUnary);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(tokens.T_MUL) },
        { ALT: () => this.CONSUME(tokens.T_DIV) },
        { ALT: () => this.CONSUME(tokens.T_MOD) },
      ]);
      this.SUBRULE2(this.ExpressionUnary);
    });
  });

  protected ExpressionUnary = this.RULE('ExpressionUnary', () => {
    this.OR([
      {
        ALT: () => {
          this.OR2([
            { ALT: () => this.CONSUME(tokens.T_NOT) },
            { ALT: () => this.CONSUME(tokens.T_SUB) },
            { ALT: () => this.CONSUME(tokens.T_CAT) },
            { ALT: () => this.CONSUME(tokens.T_INCREMENT) },
            { ALT: () => this.CONSUME(tokens.T_DECREMENT) },
          ]);
          this.SUBRULE(this.ExpressionUnary);
        },
      },
      {
        ALT: () => {
          this.CONSUME(tokens.K_TRY);
          this.OR3([
            {
              ALT: () => {
                this.CONSUME(tokens.T_QUEST);
                this.SUBRULE2(this.ExpressionUnary);
              },
            },
            {
              ALT: () => {
                this.CONSUME2(tokens.T_NOT);
                this.SUBRULE3(this.ExpressionUnary);
              },
            },
          ]);
        },
      },
      {
        GATE: () => {
          const next = this.LA(1).tokenType;
          return next !== tokens.T_INCREMENT && next !== tokens.T_DECREMENT;
        },
        ALT: () => {
          this.SUBRULE(this.ExpressionPostFix);
        },
      },
    ]);
  });

  protected ExpressionPostFix = this.RULE('ExpressionPostFix', () => {
    this.SUBRULE(this.ExpressionPrimary);
    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(tokens.T_DOT);
            this.OR2([
              { ALT: () => this.CONSUME(tokens.T_IDENTIFIER) },
              { ALT: () => this.CONSUME(tokens.T_STRING_SQ) },
              { ALT: () => this.CONSUME(tokens.T_STRING_DQ) },
              { ALT: () => this.SUBRULE(this.ConstMember) },
            ]);
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.T_SQOPEN);
            this.AT_LEAST_ONE_SEP({
              SEP: tokens.T_COMMA,
              DEF: () => {
                this.SUBRULE(this.ExpressionAssign, {
                  LABEL: 'PostFixIndex',
                });
              },
            });
            this.CONSUME(tokens.T_SQCLOSE);
          },
        },
        {
          GATE: () => this.LA(1).tokenType === tokens.T_BROPEN,
          ALT: () => {
            this.SUBRULE(this.CallArguments, {
              LABEL: 'PostFixCall',
            });
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.K_AS);
            this.OPTION(() =>
              this.CONSUME(tokens.T_QUEST, { LABEL: 'optional' })
            );
            this.SUBRULE(this.Type, { LABEL: 'PostFixCast' });
          },
        },
        {
          GATE: () => this.LA(1).tokenType === tokens.T_INCREMENT,
          ALT: () => {
            this.CONSUME(tokens.T_INCREMENT, { LABEL: 'PostFixIncrement' });
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.T_DECREMENT, { LABEL: 'PostFixDecrement' });
          },
        },
        {
          ALT: () => {
            this.CONSUME(tokens.T_LAMBDA);
            this.SUBRULE(this.FunctionLambdaBody, { LABEL: 'PostFixLambda' });
          },
        },
      ]);
    });
    this.OPTION2(() => {
      this.CONSUME(tokens.T_DOT2);
      this.SUBRULE2(this.ExpressionAssign, { LABEL: 'PostFixRange' });
    });
  });

  private ExpressionPrimary = this.RULE('ExpressionPrimary', () => {
    this.OR([
      // ExpressionLiteral
      {
        ALT: () => this.CONSUME(tokens.T_INT),
      },
      {
        ALT: () => this.CONSUME(tokens.T_PREFIXED_INT),
      },
      {
        ALT: () => this.CONSUME(tokens.T_FLOAT),
      },
      {
        ALT: () => this.CONSUME(tokens.T_STRING_SQ),
      },
      {
        ALT: () => this.CONSUME(tokens.T_STRING_DQ),
      },
      // ExpressionVariable
      {
        ALT: () => {
          this.CONSUME(tokens.T_IDENTIFIER);
          this.SUBRULE(this.TypeArguments);
        },
      },
      // ExpressionLocalVariable
      {
        ALT: () => {
          this.CONSUME(tokens.T_LOCAL_IDENTIFIER);
        },
      },
      // ExpressionThis
      {
        ALT: () => this.CONSUME(tokens.K_THIS),
      },
      // ExpressionSuper
      {
        ALT: () => this.CONSUME(tokens.K_SUPER),
      },
      // ExpressionDollar
      {
        ALT: () => this.CONSUME(tokens.T_DOLLAR),
      },
      // ExpressionArray
      {
        ALT: () => {
          this.CONSUME(tokens.T_SQOPEN);
          this.MANY_SEP({
            SEP: tokens.T_COMMA,
            DEF: () => {
              this.SUBRULE(this.ExpressionAssign);
            },
          });
          this.CONSUME(tokens.T_SQCLOSE);
        },
      },
      // ExpressionMap
      {
        ALT: () => {
          this.CONSUME(tokens.T_AOPEN);
          this.MANY_SEP2({
            SEP: tokens.T_COMMA,
            DEF: () => {
              this.SUBRULE2(this.ExpressionAssign);
              this.OPTION(() => {
                this.CONSUME(tokens.T_COLON);
                this.SUBRULE3(this.ExpressionAssign);
              });
            },
          });
          this.CONSUME(tokens.T_ACLOSE);
        },
      },
      // ExpressionBool
      {
        ALT: () => this.CONSUME(tokens.K_TRUE),
      },
      {
        ALT: () => this.CONSUME(tokens.K_FALSE),
      },
      // ExpressionNull
      {
        ALT: () => this.CONSUME(tokens.K_NULL),
      },
      // ExpressionBracket
      {
        ALT: () => {
          this.CONSUME(tokens.T_BROPEN);
          this.AT_LEAST_ONE_SEP({
            SEP: tokens.T_COMMA,
            DEF: () => {
              this.SUBRULE4(this.ExpressionAssign);
            },
          });
          this.CONSUME(tokens.T_BRCLOSE);
        },
      },
      // ExpressionNew
      {
        ALT: () => {
          this.CONSUME(tokens.K_NEW);
          this.SUBRULE(this.Type);
          this.OPTION2(() => {
            this.SUBRULE(this.CallArguments);
          });
        },
      },
      // ExpressionThrow
      {
        ALT: () => {
          this.CONSUME(tokens.K_THROW);
          this.SUBRULE(this.Expression, { LABEL: 'ExpressionThrow' });
        },
      },
      // ExpressionPanic
      {
        ALT: () => {
          this.CONSUME(tokens.K_PANIC);
          this.SUBRULE2(this.Expression, { LABEL: 'ExpressionPanic' });
        },
      },
      // ExpressionMatch
      {
        ALT: () => {
          this.CONSUME(tokens.K_MATCH);
          this.SUBRULE3(this.Expression);
          this.CONSUME2(tokens.T_AOPEN);
          this.MANY_SEP3({
            SEP: tokens.T_COMMA,
            DEF: () => {
              this.OR2([
                { ALT: () => this.CONSUME(tokens.K_DEFAULT) },
                { ALT: () => this.SUBRULE4(this.Expression) },
              ]);
              this.CONSUME(tokens.T_LAMBDA);
              this.SUBRULE5(this.Expression);
            },
          });
          this.CONSUME2(tokens.T_ACLOSE);
        },
      },
      // ExpressionBracketExpression
      {
        ALT: () => {
          this.CONSUME(tokens.T_LESS);
          // TODO
          this.CONSUME(tokens.T_GREATER);
        },
      },
      // default: Type
      {
        GATE: () => {
          const next = this.LA(1).tokenType;
          return next !== tokens.T_IDENTIFIER && next !== tokens.T_SQOPEN;
        },
        ALT: () => this.SUBRULE2(this.Type),
      },
    ]);
  });
}

export const ZCParser = new ZenCodeParser();
