import { workspace } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import {
  FSReadDirectoryRequestType,
  FSReadFileRequestType,
  FSReadFileStringRequestType,
  FSStatRequestType,
} from '../../api/requests/FileSystemRequest';

export class FileSystemReadFileRequest {
  static onRequest(client: LanguageClient): void {
    client.onRequest(FSReadFileRequestType, (uri) => {
      return workspace.fs.readFile(uri);
    });
  }
}

export class FileSystemReadFileStringRequest {
  static onRequest(client: LanguageClient): void {
    client.onRequest(FSReadFileStringRequestType, async (uri) => {
      const data = await workspace.fs.readFile(uri);
      return Buffer.from(data).toString('utf-8');
    });
  }
}

export class FileSystemReadDirectoryRequest {
  static onRequest(client: LanguageClient): void {
    client.onRequest(FSReadDirectoryRequestType, (uri) => {
      return workspace.fs.readDirectory(uri);
    });
  }
}

export class FileSystemStatRequest {
  static onRequest(client: LanguageClient): void {
    client.onRequest(FSStatRequestType, (uri) => {
      return workspace.fs.stat(uri);
    });
  }
}
