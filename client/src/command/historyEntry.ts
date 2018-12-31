import { CommandBase } from "./command";

class HistoryEntry extends CommandBase {
  public command = "zenscript.command.historyentry";
  public handler = () => {
    console.log(2333);
  };
}

export const CommandHistoryEntry = new HistoryEntry();
