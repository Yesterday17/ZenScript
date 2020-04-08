import { IPreProcessorCompletion } from './IPreProcessor';

export const HashLoader: IPreProcessorCompletion = {
  name: 'loader',
  description:
    'Scripts with the loader Preprocessor will only be loaded by the loader specified.',

  supported: true,
};
