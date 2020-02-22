import { IToken } from 'chevrotain';
import { IPreProcessor } from '../api/IPreProcessor';
import { LINE_COMMENT_PREPROCESSOR } from '../parser/zsLexer';
import { IgnoreBracketErrorHandler } from './ignoreBracketError';
import { LoaderHandler } from './loader';
import { PriorityHandler } from './priority';
import { NoRunHandler } from './norun';
import { NoWarnHandler } from './nowarn';
import { IPreProcessorCompletions } from '../completion/preprocessor/preprocessors';

export function preparePreprocessors(comments: IToken[], path: string) {
  comments
    .filter(t => t.tokenType === LINE_COMMENT_PREPROCESSOR)
    .map(t => t.image.substr(1).split(' '))
    .filter(t => PreProcessors.includes(t[0]))
    .forEach(t => PreProcessorHandlersMap.get(t[0])?.handle(path, t));
}

const PreProcessors = IPreProcessorCompletions.map(p => p.name);

const PreProcessorHandlers = [
  PriorityHandler,
  LoaderHandler,
  IgnoreBracketErrorHandler,
  NoRunHandler,
  NoWarnHandler,
];

const PreProcessorHandlersMap: Map<string, IPreProcessor> = new Map();
PreProcessorHandlers.forEach(item => {
  PreProcessorHandlersMap.set(item.completion.name, item);
});

export { PreProcessors, PreProcessorHandlersMap };
