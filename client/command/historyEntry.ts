import { window } from "vscode";
import { CommandBase } from "./CommandBase";
import {
  HistoryEntryGetRequestType,
  HistoryEntryAddRequestType
} from "../../api/requests/HistoryEntryRequest";

class HistoryEntryGet extends CommandBase {
  public command = "zenscript.command.gethistoryentry";
  public handler = () => {
    this.client.sendRequest(HistoryEntryGetRequestType).then(() => {
      window.showInformationMessage("あけおめ！");
    });
  }
}

class HistoryEntryAdd extends CommandBase {
  public command = "zenscript.command.addhistoryentry";
  public handler = () => {
    this.client.sendRequest(HistoryEntryAddRequestType, "").then(() => {
      window.showInformationMessage("History Added!");
    });
  }
}

export const CommandHistoryEntryGet = new HistoryEntryGet();
export const CommandHistoryEntryAdd = new HistoryEntryAdd();
