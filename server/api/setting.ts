import { ZenScriptSettings } from '.';

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
export const defaultSettings: ZenScriptSettings = {
  maxNumberOfProblems: 100,
  maxHistoryEntries: 20,

  showIsProjectWarn: true,
  modIdItemCompletion: false,
};
