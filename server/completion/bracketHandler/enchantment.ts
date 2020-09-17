import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { zGlobal } from '../../api/global';
import { BracketHandlerKind } from './bracketHandlers';
import { IBracketHandler } from './IBracketHandler';

class Enchantment implements IBracketHandler {
  name = 'enchantment';
  handler: CompletionItem = {
    label: this.name,
    detail: 'Access Enchantment definitions.',
    documentation: {
      kind: 'markdown',
      value:
        'The Enchantment Bracket Handler gives you access to the Enchantment definitions in the game.  \n' +
        'They are referenced in the Enchantment handler this way:  \n' +
        '```\n' +
        '<enchantment:modid:name>\n' +
        '\n' +
        '<enchantment:minecraft:protection>\n' +
        '```\n' +
        'If the Enchantment is found, this will return an IEnchantmentDefinition Object.  \n' +
        'Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Enchantments/IEnchantmentDefinition/)' +
        ' for further information on what you can do with these.',
    },
  };

  check(predecessor: string[]): boolean {
    if (predecessor.length === 3 && zGlobal.enchantments.has(predecessor[1])) {
      const enchantment = zGlobal.enchantments.get(predecessor[1]);
      if (enchantment) {
        return !!enchantment.find(
          (e) => e.resourceLocation.path === predecessor[2]
        );
      }
    }
    return false;
  }

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // enchantment:[modid]
        return Array.from(zGlobal.enchantments.keys()).map((key) => {
          return {
            label: key,
            kind: BracketHandlerKind,
            data: {
              triggerCharacter: ':',
              predecessor,
            },
          } as CompletionItem;
        });
      case 2:
        // enchantment:modid:[enchantment]
        if (zGlobal.enchantments.has(predecessor[1])) {
          const enchantment = zGlobal.enchantments.get(predecessor[1]);
          if (enchantment) {
            return enchantment.map((item, i) => {
              return {
                label: item.resourceLocation.path,
                filterText: [
                  item.name,
                  item.unlocalizedName,
                  item.resourceLocation.path,
                ].join(''),
                kind: CompletionItemKind.Value,
                data: {
                  triggerCharacter: ':',
                  predecessor,
                  position: i,
                },
              };
            });
          }
        }
        return [];
      default:
        return [];
    }
  }

  detail(item: CompletionItem): CompletionItem {
    switch (item.data.predecessor.length) {
      case 1:
        // enchantment:[modid]
        if (!zGlobal.mods.has(item.label)) {
          // For example, minecraft
          return item;
        }
        const mod = zGlobal.mods.get(item.label);
        if (mod) {
          return {
            ...item,
            detail: mod.name,
            documentation: {
              kind: 'markdown',
              value: mod.description,
            },
          };
        }
        return item;
      case 2:
        // enchantment:modid:[enchantment]
        const enchantment = zGlobal.enchantments.get(item.data.predecessor[1]);
        if (enchantment) {
          const detail = enchantment[item.data.position];
          return {
            ...item,
            detail: detail.name,
            documentation: {
              kind: 'markdown',
              value: '**Type**: ' + detail.type,
            },
          };
        }
        return item;
      default:
        return item;
    }
  }
}

export const EnchantmentBracketHandler = new Enchantment();
