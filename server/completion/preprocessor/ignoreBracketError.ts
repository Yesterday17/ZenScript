import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const HashIgnoreBracketError: IPreProcessorCompletion = {
  name: 'ignoreBracketError',
  description: 'All error logging on bracket errors will be supressed.',

  supported: true,
};
