import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const DebugPreProcessor: IPreProcessorCompletion = {
  name: 'debug',
  description:
    'It globally enables debug mode. This mode outputs the parsed script files.',

  supported: false,
};
