import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const HashSideOnly: IPreProcessorCompletion = {
  name: 'sideonly',
  description:
    'Preprocessor can be used as follows:\n' +
    '#sideonly sidename\n' +
    'Example:\n' +
    '#sideonly client\n' +
    'This will make scripts only being loaded when the loader is the specified side of the network\n\n' +
    'just leaving this loader away will cause it to be loaded on both sides',

  supported: false,
};
