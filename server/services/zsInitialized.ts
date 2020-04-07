import { InitializeResult, WorkspaceFolder } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { zGlobal } from '../api/global';
import { ZenParsedFile } from '../api/zenParsedFile';
import * as fs from '../utils/fs';
import * as path from '../utils/path';
import { AllZSFiles } from '../utils/path';
import { reloadRCFile } from '../utils/zsrcFile';
import { ZenScriptWorkspaceServices } from './services';
import { ZenScriptActiveService } from './zsService';

export class ZenScriptInitialized extends ZenScriptActiveService {
  apply(service: InitializeResult): void {
    zGlobal.conn.onInitialized(async () => {
      // Override the global setting.
      zGlobal.setting = await zGlobal.conn.workspace.getConfiguration({
        scopeUri: 'resource',
        section: 'zenscript',
      });

      // No Folder is opened / foldername !== scripts
      // disable most of language server features
      let folder: WorkspaceFolder;
      for (const f of zGlobal.client.folders) {
        const furi = URI.parse(f.uri),
          fbase = path.basename(furi);
        if (
          f.name === 'scripts' ||
          fbase === 'scripts' ||
          (await fs.existInDirectory(furi, '.zsrc', zGlobal.conn)) // Remote url fix
        ) {
          folder = f;
        } else if (
          zGlobal.setting.supportMinecraftFolderMode &&
          (await fs.exists(path.join(furi, 'scripts'), zGlobal.conn))
        ) {
          // Rejudge minecraft folder mode
          folder = {
            ...f,
            uri: path.join(furi, 'scripts').toString(),
          };
        }
      }

      // whether the target folder exists
      if (folder) {
        zGlobal.baseFolder = folder.uri;
        await reloadRCFile(zGlobal.conn);

        // Load all files
        zGlobal.bus.revoke('all-zs-parsed');
        const files = await AllZSFiles(
          URI.parse(zGlobal.baseFolder),
          zGlobal.conn,
          'scripts'
        );
        for (const { uri, pkg } of files) {
          // new parsed file
          const zsFile = new ZenParsedFile(uri, pkg, zGlobal.conn);
          // save to map first
          zGlobal.zsFiles.set(uri.toString(), zsFile);
          // then lex(not parse to save time)
          await zsFile.load();
          zsFile.parse();
        }
      } else {
        zGlobal.isProject = false;
      }
      zGlobal.bus.finish('all-zs-parsed');

      // Isn't a folder warn.
      if (
        zGlobal.baseFolder === '' &&
        !zGlobal.isProject &&
        zGlobal.setting.showIsProjectWarn
      ) {
        // TODO: Localize the following string
        zGlobal.conn.window
          .showWarningMessage(`ZenScript didn't enable all its features!
        Please check your folder name, it must be 'scripts', or a folder in your workspace must be named 'scripts'.`);
      }

      ZenScriptWorkspaceServices.forEach((s) => {
        if (s.test(zGlobal.client)) {
          s.apply();
        }
      });
    });
  }
}
