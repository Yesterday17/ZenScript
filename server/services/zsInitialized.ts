import { InitializeResult } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { ServerStatusRequestType } from '../../api/requests/ServerStatusRequest';
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
      const i = setInterval(() => {
        zGlobal.conn.sendRequest(
          ServerStatusRequestType,
          (() => {
            if (zGlobal.isProject && !zGlobal.bus.isFinished('rc-loaded')) {
              return false;
            }
            const result = zGlobal.bus.isFinished('all-zs-parsed');

            if (result) {
              // TODO
              // clearInterval(i);
            }
            return result;
          })()
        );
      }, 500);

      // Override the global setting.
      zGlobal.setting = await zGlobal.conn.workspace.getConfiguration({
        scopeUri: 'resource',
        section: 'zenscript',
      });

      // No Folder is opened / foldername !== scripts
      // disable most of language server features
      let folderURI: URI;
      for (const f of zGlobal.client.folders) {
        const furi = URI.parse(f.uri),
          fbase = path.basename(furi);
        if (
          f.name === 'scripts' ||
          fbase === 'scripts' ||
          (await fs.existInDirectory(furi, '.zsrc', zGlobal.conn)) // Remote url fix
        ) {
          folderURI = furi;
        } else if (
          zGlobal.setting.supportMinecraftFolderMode &&
          (await fs.exists(path.join(furi, 'scripts'), zGlobal.conn))
        ) {
          // Rejudge minecraft folder mode
          folderURI = path.join(furi, 'scripts');
        }
      }

      // whether the target folder exists
      if (folderURI) {
        zGlobal.isProject = true;
        zGlobal.baseFolderUri = folderURI;
        await reloadRCFile();

        // Load all files
        zGlobal.bus.revoke('all-zs-parsed');
        const files = await AllZSFiles(folderURI, zGlobal.conn, 'scripts');
        for (const { uri, pkg } of files) {
          // new parsed file
          const zsFile = new ZenParsedFile(uri, pkg, zGlobal.conn);
          // save to map first
          zGlobal.zsFiles.set(uri.toString(), zsFile);
          // then lex(not parse to save time)
          await zsFile.load();
          zsFile.parse();
        }
      }
      zGlobal.bus.finish('all-zs-parsed');

      // Isn't a folder warn.
      if (
        zGlobal.baseFolderUri &&
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
