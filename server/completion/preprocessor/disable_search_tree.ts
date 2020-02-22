import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const HashDisableSearchTree: IPreProcessorCompletion = {
  name: 'disable_search_tree',
  description:
    'Preprocessor will disable recipe tree recalculation which may speed up game loading.',

  supported: false,
};
