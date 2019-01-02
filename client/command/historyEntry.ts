import { window } from "vscode";
import { CommandBase } from "./command";
import { HistoryEntryGetRequestType } from "@/requests/HistoryEntryRequest";

class HistoryEntry extends CommandBase {
  public command = "zenscript.command.historyentry";
  public handler = () => {
    this.client.sendRequest(HistoryEntryGetRequestType).then(() => {
      window.showInformationMessage("あけおめ！");
    });
  }
}

export const CommandHistoryEntry = new HistoryEntry();
