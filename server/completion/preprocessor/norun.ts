import { IPreProcessorCompletion } from 'server/api/IPreProcessor';

export const NoRunPreProcessor: IPreProcessorCompletion = {
  name: 'norun',
  description:
    'It completely disables the script it’s added to from being loaded into the game.',

  supported: false,
};
