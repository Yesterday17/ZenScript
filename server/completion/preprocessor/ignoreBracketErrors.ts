import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const HashIgnoreBracketErrors: IPreProcessorCompletion = {
  name: 'ignoreBracketErrors',
  description: 'All error logging on bracket errors will be supressed.',

  supported: true,
};
