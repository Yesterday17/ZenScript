import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { IBracketHandler } from '../../api/IBracketHandler';

class DamageSource implements IBracketHandler {
  name = 'damageSource';
  handler: CompletionItem = {
    label: this.name,
    detail: 'Refer to IDamageSources.',
    documentation: {
      kind: 'markdown',
      value:
        'The Damage Source Bracket Handler allows you to refer to [IDamageSources](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Damage/IDamageSource/) in the game.  \n' +
        'If the Damage source is not one of the predefined ones, this will create a new one with the given name.  \n' +
        '\n' +
        '```\n' +
        '<damageSource:type>;\n' +
        '<damageSource:IN_FIRE>;\n' +
        '```',
    },
  };

  next(predecessor: string[]): CompletionItem[] {
    if (predecessor.length === 1) {
      return [
        'IN_FIRE',
        'LIGHTNING_BOLT',
        'ON_FIRE',
        'LAVA',
        'HOT_FLOOR',
        'IN_WALL',
        'CRAMMING',
        'DROWN',
        'STARVE',
        'CACTUS',
        'FALL',
        'FLY_INTO_WALL',
        'OUT_OF_WORLD',
        'GENERIC',
        'MAGIC',
        'WITHER',
        'ANVIL',
        'FALLING_BLOCK',
        'DRAGON_BREATH',
        'FIREWORKS',
      ].map(key => {
        return {
          label: key,
          kind: CompletionItemKind.Value,
          data: {
            triggerCharacter: ':',
            predecessor,
          },
        } as CompletionItem;
      });
    }
    return [];
  }

  // TODO: Add detail here. (But there's no detail in wiki)
  detail(item: CompletionItem): CompletionItem {
    return { ...item, detail: 'Vanilla' };
  }
}

export const DamageSourceBracketHandler = new DamageSource();
