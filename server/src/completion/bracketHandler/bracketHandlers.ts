import { CompletionItemKind, CompletionItem } from "vscode-languageserver";
import { CreativeTabBracketHandler } from "./creativetab";
import { DamageSourceBracketHandler } from "./damageSource";
import { EnchantmentBracketHandler } from "./enchantment";
import { EntityBracketHandler } from "./entity";
import { LiquidBracketHandler, FluidBracketHandler } from "./liquid";
import { OreBracketHandler } from "./ore";
import { PotionBracketHandler } from "./potion";
import { ItemBracketHandler } from "./item";

const BracketHandlerKind: CompletionItemKind = CompletionItemKind.Unit;

// TODO: Support all the bracketHandlers here.
const BracketHandlers: CompletionItem[] = [
  CreativeTabBracketHandler,
  DamageSourceBracketHandler,
  EnchantmentBracketHandler,
  ItemBracketHandler,
  EntityBracketHandler,
  LiquidBracketHandler,
  FluidBracketHandler, // fluid is an alias of liquid
  OreBracketHandler,
  PotionBracketHandler
];

export const SimpleBracketHandlers: CompletionItem[] = BracketHandlers.map(
  (item: CompletionItem) => {
    return { label: item.label, kind: BracketHandlerKind };
  }
);

export const DetailBracketHandlers: CompletionItem[] = BracketHandlers.map(
  (item: CompletionItem) => {
    return {
      kind: BracketHandlerKind,
      ...item
    };
  }
);
