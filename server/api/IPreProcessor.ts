export interface IPreProcessorCompletion {
  name: string;
  description: string;

  supported: boolean;
}

export interface IPreProcessor {
  completion: IPreProcessorCompletion;
  handle(path: string, args: string[]): void;
}
