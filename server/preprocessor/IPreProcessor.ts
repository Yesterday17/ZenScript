import { IPreProcessorCompletion } from '../completion/preprocessor/IPreProcessor';

export interface IPreProcessor {
  completion: IPreProcessorCompletion;
  handle(path: string, args: string[]): void;
}
