import { LanguageClient } from 'vscode-languageclient';
import {
  FileSystemReadDirectoryRequest,
  FileSystemReadFileRequest,
  FileSystemReadFileStringRequest,
  FileSystemStatRequest,
} from './fileSystem';
import { StatusBarRequest } from './statusBar';

const Requests = [
  FileSystemReadFileRequest,
  FileSystemReadFileStringRequest,
  FileSystemReadDirectoryRequest,
  FileSystemStatRequest,
  StatusBarRequest,
];

export function applyRequests(client: LanguageClient) {
  Requests.forEach((req) => req.onRequest(client));
}
