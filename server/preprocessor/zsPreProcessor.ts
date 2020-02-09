import { PriorityHandler } from './priority';
import { IPreProcessor } from '../api/IPreProcessor';
import { IToken } from 'chevrotain';
import { LINE_COMMENT_PREPROCESSOR } from '../parser/zsLexer';

export function preparePreprocessors(comments: IToken[], path: string) {
  comments
    .filter(t => t.tokenType === LINE_COMMENT_PREPROCESSOR)
    .map(t => t.image.substr(1).split(' '))
    .filter(t => PreProcessors.includes(t[0]))
    .forEach(t => PreProcessorHandlersMap.get(t[0]).handle(path, t));
}

const PreProcessors = [
  'debug',
  'ignoreBracketErrors',
  'loader',
  'modloaded',
  'norun',
  'priority',
];

const PreProcessorHandlers = [PriorityHandler];

const PreProcessorHandlersMap: Map<string, IPreProcessor> = new Map();
PreProcessorHandlers.forEach(item => {
  PreProcessorHandlersMap.set(item.completion.name, item);
});

export { PreProcessors, PreProcessorHandlersMap };
