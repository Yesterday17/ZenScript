import { CompletionItemKind, CompletionItem } from "vscode-languageserver";
import { CreativeTabBracketHandler } from "./creativetab";
import { DamageSourceBracketHandler } from "./damageSource";
import { EnchantmentBracketHandler } from "./enchantment";

const BracketHandlerKind: CompletionItemKind = CompletionItemKind.Unit;

// TODO: Support all the bracketHandlers here.
const BracketHandlers: CompletionItem[] = [
  CreativeTabBracketHandler,
  DamageSourceBracketHandler,
  EnchantmentBracketHandler
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
