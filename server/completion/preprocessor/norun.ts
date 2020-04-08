import { IPreProcessorCompletion } from './IPreProcessor';

export const HashNoRun: IPreProcessorCompletion = {
  name: 'norun',
  description:
    'It completely disables the script it’s added to from being loaded into the game.',

  supported: true,
};
