import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

export const Keywords: CompletionItem[] = [
  { label: 'any', kind: CompletionItemKind.Keyword },
  { label: 'bool', kind: CompletionItemKind.Keyword },
  { label: 'byte', kind: CompletionItemKind.Keyword },
  { label: 'short', kind: CompletionItemKind.Keyword },
  { label: 'int', kind: CompletionItemKind.Keyword },
  { label: 'long', kind: CompletionItemKind.Keyword },
  { label: 'float', kind: CompletionItemKind.Keyword },
  { label: 'double', kind: CompletionItemKind.Keyword },
  { label: 'string', kind: CompletionItemKind.Keyword },
  { label: 'function', kind: CompletionItemKind.Keyword },
  { label: 'in', kind: CompletionItemKind.Keyword },
  { label: 'void', kind: CompletionItemKind.Keyword },
  { label: 'as', kind: CompletionItemKind.Keyword },
  { label: 'version', kind: CompletionItemKind.Keyword },
  { label: 'if', kind: CompletionItemKind.Keyword },
  { label: 'else', kind: CompletionItemKind.Keyword },
  { label: 'for', kind: CompletionItemKind.Keyword },
  { label: 'return', kind: CompletionItemKind.Keyword },
  { label: 'var', kind: CompletionItemKind.Keyword },
  { label: 'val', kind: CompletionItemKind.Keyword },
  { label: 'null', kind: CompletionItemKind.Keyword },
  { label: 'true', kind: CompletionItemKind.Keyword },
  { label: 'false', kind: CompletionItemKind.Keyword },
  { label: 'import', kind: CompletionItemKind.Keyword }
];

export const Preprocessors = [
  'debug',
  'ignoreBracketErrors',
  'loader',
  'modloaded',
  'norun',
  'priority'
].map(item => {
  return {
    label: item,
    kind: CompletionItemKind.EnumMember
  } as CompletionItem;
});
