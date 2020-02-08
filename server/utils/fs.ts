import { Connection } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import {
  FSReadDirectoryRequestType,
  FSReadFileRequestType,
  FSStatRequestType,
  FSReadFileStringRequestType,
} from '../../api/requests/FileSystemRequest';

/**
 * Enumeration of file types. The types `File` and `Directory` can also be
 * a symbolic links, in that case use `FileType.File | FileType.SymbolicLink` and
 * `FileType.Directory | FileType.SymbolicLink`.
 */
export enum FileType {
  /**
   * The file type is unknown.
   */
  Unknown = 0,
  /**
   * A regular file.
   */
  File = 1,
  /**
   * A directory.
   */
  Directory = 2,
  /**
   * A symbolic link to a file.
   */
  SymbolicLink = 64,
}

export async function readFile(uri: URI, connection: Connection) {
  return await connection.sendRequest(FSReadFileRequestType, uri);
}

export async function readFileString(uri: URI, connection: Connection) {
  return await connection.sendRequest(FSReadFileStringRequestType, uri);
}

export async function readDirectory(uri: URI, connection: Connection) {
  return await connection.sendRequest(FSReadDirectoryRequestType, uri);
}

export async function stat(uri: URI, connection: Connection) {
  return await connection.sendRequest(FSStatRequestType, uri);
}

export async function exists(uri: URI, connection: Connection) {
  return !!(await stat(uri, connection));
}

export function isFile(type: FileType): boolean {
  return type === FileType.File;
}

export function isDirectory(type: FileType): boolean {
  return type === FileType.Directory;
}
