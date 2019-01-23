import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { DebugPreProcessor } from './debug';
import { IgnoreBracketErrorsPreProcessor } from './ignoreBracketErrors';
import { LoaderPreProcessor } from './loader';
import { ModLoadedPreProcessor } from './modloaded';
import { NoRunPreProcessor } from './norun';
import { PriorityPreProcessor } from './priotiry';

export const PreProcessorCompletions: CompletionItem[] = [
  DebugPreProcessor,
  IgnoreBracketErrorsPreProcessor,
  LoaderPreProcessor,
  ModLoadedPreProcessor,
  NoRunPreProcessor,
  PriorityPreProcessor,
].map(item => {
  return {
    label: item.name,
    detail: (!item.supported ? '[NOT SUPPORTED]\n' : '') + item.description,
    kind: CompletionItemKind.EnumMember,
  } as CompletionItem;
});
