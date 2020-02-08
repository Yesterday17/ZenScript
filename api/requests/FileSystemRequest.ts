import { FileStat, FileType, Uri } from 'vscode';
import { RequestType } from 'vscode-jsonrpc';

// workspace.fs wrapper since lsp does not support fs
// https://github.com/microsoft/language-server-protocol/issues/809

export const FSReadFileRequestType: RequestType<
  Uri,
  Thenable<Uint8Array>,
  null,
  null
> = new RequestType('zenScript/fsReadFile');

export const FSReadFileStringRequestType: RequestType<
  Uri,
  Thenable<string>,
  null,
  null
> = new RequestType('zenScript/fsReadFileString');

export const FSReadDirectoryRequestType: RequestType<
  Uri,
  Thenable<[string, FileType][]>,
  null,
  null
> = new RequestType('zenScript/fsReadDirectory');

export const FSStatRequestType: RequestType<
  Uri,
  Thenable<FileStat>,
  null,
  null
> = new RequestType('zenScript/fsStat');
