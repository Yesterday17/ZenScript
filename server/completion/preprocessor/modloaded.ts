import { IPreProcessorCompletion } from './IPreProcessor';

export const HashModLoaded: IPreProcessorCompletion = {
  name: 'modloaded',
  description:
    'If you added this preprocessor to a script, it will only be executed if the provided modID’s are present.',

  supported: false,
};
