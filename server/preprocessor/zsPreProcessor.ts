import { PriorityHandler } from './priority';
import { IPreProcessor } from '../api/IPreProcessor';

export function getPreProcessorList(text: string, p: string[]): string[] {
  const result: string[] = [];
  const list = text.match(/#[^\r\n]+/g);

  if (list) {
    list
      .map(find => find.substr(1))
      .forEach(find => {
        if (p.indexOf(find.split(' ')[0]) !== -1) {
          result.push(find);
        }
      });
  }

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
