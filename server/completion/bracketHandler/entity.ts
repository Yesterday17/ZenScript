import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { zGlobal } from '../../api/global';
import { BracketHandlerKind } from './bracketHandlers';
import { IBracketHandler } from './IBracketHandler';

class Entity implements IBracketHandler {
  name = 'entity';
  handler: CompletionItem = {
    label: this.name,
    detail: 'Access Entities.',
    documentation: {
      kind: 'markdown',
      value:
        "The Entity Bracket Handler gives you access to the Entities (e.g. Mobs, tile ents etc.) in the game. It is only possible to get entities registered in the game, so adding or removing mods may cause issues if you reference the mod's mobs in an Entity Bracket Handler.  \n" +
        'Entities are referenced in the Entity handler this way:  \n' +
        '```\n' +
        '<entity:modID:entityName>\n' +
        '\n' +
        '<entity:minecraft:sheep>\n' +
        '```\n' +
        'If the mob/entity is found, this will return an IEntityDefinition Object.  \n' +
        'Please refer to the [respective Wiki entry](https://crafttweaker.readthedocs.io/en/latest/#Vanilla/Entities/IEntityDefinition/)' +
        ' for further information on what you can do with these.',
    },
  };

  check(predecessor: string[]): boolean {
    return (
      predecessor.length === 3 &&
      zGlobal.entities.has(predecessor[1]) &&
      zGlobal.entities
        .get(predecessor[1])
        .find((e) => e.resourceLocation.path === predecessor[2]) !== undefined
    );
  }

  next(predecessor: string[]): CompletionItem[] {
    switch (predecessor.length) {
      case 1:
        // entity:[modid]
        const result = Array.from(zGlobal.entities.keys()).map((key) => {
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
        // entity:modid:[item]
        return zGlobal.entities.has(predecessor[1])
          ? zGlobal.entities.get(predecessor[1]).map((item, i) => {
              return {
                label: item.resourceLocation.path,
                filterText: [item.name, item.resourceLocation.path].join(''),
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
        // entity:[modid]
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
        // entity:modid:[item]
        const entityFound = zGlobal.entities.get(item.data.predecessor[1])[
          item.data.position
        ];
        return {
          ...item,
          detail: entityFound.name,
          documentation: {
            kind: 'markdown',
            value: ``,
          },
        };
      default:
        return item;
    }
  }
}

export const EntityBracketHandler = new Entity();
