import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const LoaderPreProcessor: IPreProcessorCompletion = {
  name: 'loader',
  description:
    'Scripts with the loader Preprocessor will only be loaded by the loader specified.',

  supported: false,
};
