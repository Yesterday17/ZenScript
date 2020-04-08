import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { CreativeTabBracketHandler } from './creativetab';
import { DamageSourceBracketHandler } from './damageSource';
import { EnchantmentBracketHandler } from './enchantment';
import { EntityBracketHandler } from './entity';
import { IBracketHandler } from './IBracketHandler';
import { ItemBracketHandler } from './item';
import { FluidBracketHandler, LiquidBracketHandler } from './liquid';
import { OreBracketHandler } from './ore';
import { PotionBracketHandler } from './potion';

export const BracketHandlerKind: CompletionItemKind = CompletionItemKind.Unit;

// TODO: Support all the bracketHandlers here.
export const BracketHandlers: IBracketHandler[] = [
  CreativeTabBracketHandler,
  DamageSourceBracketHandler,
  EnchantmentBracketHandler,
  ItemBracketHandler,
  EntityBracketHandler,
  LiquidBracketHandler,
  FluidBracketHandler, // fluid is an alias of liquid
  OreBracketHandler,
  PotionBracketHandler,
];

export const BracketHandlerMap: Map<string, IBracketHandler> = new Map();

BracketHandlers.forEach((handler) => {
  BracketHandlerMap.set(handler.handler.label, handler);
});

export const SimpleBracketHandlers: CompletionItem[] = BracketHandlers.map(
  (item: IBracketHandler) => {
    return {
      label: item.handler.label,
      kind: CompletionItemKind.Class,
      data: { triggerCharacter: '<' },
    };
  }
);

export const DetailBracketHandlers: CompletionItem[] = BracketHandlers.map(
  (item: IBracketHandler) => {
    return {
      kind: CompletionItemKind.Class,
      ...item.handler,
    };
  }
);
