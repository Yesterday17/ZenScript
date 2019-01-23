import { IPreProcessorCompletion } from 'server/api/IPreProcessor';

export const IgnoreBracketErrorsPreProcessor: IPreProcessorCompletion = {
  name: 'ignoreBracketErrors',
  description: 'All error logging on bracket errors will be supressed.',

  supported: false,
};
