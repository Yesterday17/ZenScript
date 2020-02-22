import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { HashDebug } from './debug';
import { HashDisableSearchTree } from './disable_search_tree';
import { HashIgnoreBracketErrors } from './ignoreBracketErrors';
import { HashLoader } from './loader';
import { HashModLoaded } from './modloaded';
import { HashNoRun } from './norun';
import { HashNoWarn } from './nowarn';
import { HashPriority } from './priotiry';
import { HashProfile } from './profile';
import { HashSideOnly } from './sideonly';

export const IPreProcessorCompletions = [
  HashDebug,
  HashIgnoreBracketErrors,
  HashLoader,
  HashModLoaded,
  HashNoRun,
  HashNoWarn,
  HashPriority,
  HashProfile,
  HashDisableSearchTree,
  HashSideOnly,
];

export const PreProcessorCompletions: CompletionItem[] = IPreProcessorCompletions.map(
  item => {
    return {
      label: item.name,
      detail: (!item.supported ? '[NOT SUPPORTED]\n' : '') + item.description,
      kind: CompletionItemKind.EnumMember,
    };
  }
);
