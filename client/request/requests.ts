import { LanguageClient } from 'vscode-languageclient';
import {
  FileSystemReadDirectoryRequest,
  FileSystemReadFileRequest,
  FileSystemReadFileStringRequest,
  FileSystemStatRequest,
} from './fileSystem';

const Requests = [
  FileSystemReadFileRequest,
  FileSystemReadFileStringRequest,
  FileSystemReadDirectoryRequest,
  FileSystemStatRequest,
];

export function applyRequests(client: LanguageClient) {
  Requests.forEach(req => req.onRequest(client));
}
