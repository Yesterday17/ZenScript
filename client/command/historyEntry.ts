import { window } from "vscode";
import { CommandBase } from "./command";
import { HistoryEntryGetRequest } from "../api/HistoryEntryRequest";

class HistoryEntry extends CommandBase {
  public command = "zenscript.command.historyentry";
  public handler = () => {
    this.client.sendRequest(HistoryEntryGetRequest).then(() => {
      window.showInformationMessage("あけおめ！");
    });
  }
}

export const CommandHistoryEntry = new HistoryEntry();
