import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const IgnoreBracketErrorsPreProcessorCompletion: IPreProcessorCompletion = {
  name: 'ignoreBracketErrors',
  description: 'All error logging on bracket errors will be supressed.',

  supported: false,
};
