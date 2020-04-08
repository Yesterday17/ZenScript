import { IToken } from 'chevrotain';
import { IPreProcessorCompletions } from '../completion/preprocessor/preprocessors';
import { LINE_COMMENT_PREPROCESSOR } from '../parser/zsLexer';
import { IgnoreBracketErrorsHandler } from './ignoreBracketErrors';
import { IPreProcessor } from './IPreProcessor';
import { LoaderHandler } from './loader';
import { NoRunHandler } from './norun';
import { NoWarnHandler } from './nowarn';
import { PriorityHandler } from './priority';

export function preparePreprocessors(comments: IToken[], path: string) {
  comments
    .filter((t) => t.tokenType === LINE_COMMENT_PREPROCESSOR)
    .map((t) => t.image.substr(1).split(' '))
    .filter((t) => PreProcessors.includes(t[0]))
    .forEach((t) => PreProcessorHandlersMap.get(t[0])?.handle(path, t));
}

const PreProcessors = IPreProcessorCompletions.map((p) => p.name);

const PreProcessorHandlers = [
  PriorityHandler,
  LoaderHandler,
  IgnoreBracketErrorsHandler,
  NoRunHandler,
  NoWarnHandler,
];

const PreProcessorHandlersMap: Map<string, IPreProcessor> = new Map();
PreProcessorHandlers.forEach((item) => {
  PreProcessorHandlersMap.set(item.completion.name, item);
});

export { PreProcessors, PreProcessorHandlersMap };
