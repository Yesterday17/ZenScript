import { IPreProcessorCompletion } from './IPreProcessor';

export const HashPriority: IPreProcessorCompletion = {
  name: 'priority',
  description:
    'The higher a script’s priority the earlier it is getting executed.\n' +
    'Scripts with the same priority will be sorted alphabetically using their pathname.',

  supported: false,
};
