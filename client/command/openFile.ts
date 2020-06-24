import { Uri, window } from 'vscode';
import { CommandBase } from '../api/CommandBase';

class OpenFile extends CommandBase {
  public command = 'zenscript.command.openfile';
  public handler = (path: string) => {
    window.showTextDocument(Uri.parse(path));
  };
}

export const CommandOpenFile = new OpenFile();
