import { IPreProcessorCompletion } from '../../api/IPreProcessor';

export const HashDebug: IPreProcessorCompletion = {
  name: 'debug',
  description:
    'It globally enables debug mode. This mode outputs the parsed script files.',

  supported: false,
};
