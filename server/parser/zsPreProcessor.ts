export function getPreProcessorList(text: string, list: string[]): string[] {
  const result = [text];
  result[0].replace(/#(.+)/g, (str, find) => {
    if (list.indexOf(find.split(' ')[0]) !== -1) {
      result.push(find.split(' '));
      return '';
    } else {
      return str;
    }
  });
  return result;
}

export const PreProcessors = [
  'debug',
  'ignoreBracketErrors',
  'loader',
  'modloaded',
  'norun',
  'priority',
];
