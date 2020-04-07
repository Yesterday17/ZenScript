import {
  ClientCapabilities,
  InitializeResult,
  WorkspaceFolder,
} from 'vscode-languageserver';

export interface ClientInfo {
  info: string;

  isFolder: boolean;
  folders: WorkspaceFolder[];
  capability: ClientCapabilities;
}

export abstract class ZenScriptService {
  /**
   * Test whether a service should be applied.
   * @param client Client.
   */
  abstract test(client: ClientInfo): boolean;

  /**
   * Apply a ZenScript Language Service
   */
  abstract apply(service: InitializeResult): void;
}

export abstract class ZenScriptActiveService implements ZenScriptService {
  test(client: ClientInfo): boolean {
    return true;
  }

  abstract apply(service: InitializeResult): void;
}

export abstract class ZenScriptInitializedService {
  /**
   * Test whether a service should be applied.
   * @param client Client.
   */
  abstract test(client: ClientInfo): boolean;

  /**
   * Apply a ZenScript Language Service
   */
  abstract apply(): void;
}
