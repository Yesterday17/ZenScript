import { PriorityHandler } from './priority';
import { IPreProcessor } from '../api/IPreProcessor';

export function getPreProcessorList(text: string, list: string[]): string[] {
  const result = [text];
  result[0].replace(/#([^\r\n]+)/g, (str, find) => {
    if (list.indexOf(find.split(' ')[0]) !== -1) {
      result.push(find);
      return '';
    } else {
      return str;
    }
  });
  return result;
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
