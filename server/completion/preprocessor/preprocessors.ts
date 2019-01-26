import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { DebugPreProcessorCompletion } from './debug';
import { IgnoreBracketErrorsPreProcessorCompletion } from './ignoreBracketErrors';
import { LoaderPreProcessorCompletion } from './loader';
import { ModLoadedPreProcessorCompletion } from './modloaded';
import { NoRunPreProcessorCompletion } from './norun';
import { PriorityPreProcessorCompletion } from './priotiry';

export const PreProcessorCompletions: CompletionItem[] = [
  DebugPreProcessorCompletion,
  IgnoreBracketErrorsPreProcessorCompletion,
  LoaderPreProcessorCompletion,
  ModLoadedPreProcessorCompletion,
  NoRunPreProcessorCompletion,
  PriorityPreProcessorCompletion,
].map(item => {
  return {
    label: item.name,
    detail: (!item.supported ? '[NOT SUPPORTED]\n' : '') + item.description,
    kind: CompletionItemKind.EnumMember,
  } as CompletionItem;
});
