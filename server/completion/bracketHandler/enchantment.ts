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

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // enchantment:[modid]
        const result = Array.from(zGlobal.enchantments.keys()).map((key) => {
          return {
            label: key,
            kind: BracketHandlerKind,
            data: {
              triggerCharacter: ':',
              predecessor,
            },
          } as CompletionItem;
        });
        return result;
      case 2:
        // enchantment:modid:[enchantment]
        return zGlobal.enchantments.has(predecessor[1])
          ? zGlobal.enchantments.get(predecessor[1]).map((item, i) => {
              const enchantmentFound = zGlobal.enchantments.get(predecessor[1])[
                i
              ];
              return {
                label: item.resourceLocation.path,
                filterText: [
                  enchantmentFound.name,
                  enchantmentFound.unlocalizedName,
                  enchantmentFound.resourceLocation.path,
                ].join(''),
                kind: CompletionItemKind.Value,
                data: {
                  triggerCharacter: ':',
                  predecessor,
                  position: i,
                },
              } as CompletionItem;
            })
          : [];
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
          // TODO: Add description for minecraft.
          return item;
        }
        const mod = zGlobal.mods.get(item.label);
        return {
          ...item,
          detail: mod.name,
          documentation: {
            kind: 'markdown',
            value: mod.description,
          },
        };
      case 2:
        // enchantment:modid:[enchantment]
        const enchantmentFound = zGlobal.enchantments.get(
          item.data.predecessor[1]
        )[item.data.position];
        return {
          ...item,
          detail: enchantmentFound.name,
          documentation: {
            kind: 'markdown',
            value: '**Type**: ' + enchantmentFound.type,
          },
        };
      default:
        return item;
    }
  }
}

export const EnchantmentBracketHandler = new Enchantment();
