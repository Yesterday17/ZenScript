import { window } from 'vscode';
import { CommandBase } from './CommandBase';
import {
  HistoryEntryGetRequestType,
  HistoryEntryAddRequestType
} from '../../api/requests/HistoryEntryRequest';

class HistoryEntryGet extends CommandBase {
  public command = 'zenscript.command.gethistoryentry';
  public handler = () => {
    this.client.sendRequest(HistoryEntryGetRequestType).then(items => {
      if (items.length === 0) {
        window.showInformationMessage('No HistoryEntry available!');
        return;
      }

      window.showQuickPick(items.map(item => item.element)).then(selected => {
        window.activeTextEditor.edit(builder => {
          window.activeTextEditor.selections.forEach(selection => {
            builder.replace(selection, selected);
            this.client.sendRequest(HistoryEntryAddRequestType, selected);
          });
        });
        window.showInformationMessage(selected);
      });
    });
  }
}

class HistoryEntryAdd extends CommandBase {
  public command = 'zenscript.command.addhistoryentry';
  public handler = () => {
    // If anything is selected
    if (
      window.activeTextEditor.selection.start.compareTo(
        window.activeTextEditor.selection.end
      ) !== 0
    ) {
      // Get selected value
      const value = window.activeTextEditor.document.getText(
        window.activeTextEditor.selection
      );
      // Send request
      this.client.sendRequest(HistoryEntryAddRequestType, value).then(() => {
        window.showInformationMessage(`${value} Added!`);
      });
    } else {
      // Nothing is selected, open an inputbox
      window
        .showInputBox({ placeHolder: 'History entry to add:' })
        .then(value => {
          if (value) {
            this.client
              .sendRequest(HistoryEntryAddRequestType, value)
              .then(() => {
                window.showInformationMessage(`${value} Added!`);
              });
          }
        });
    }
  }
}

export const CommandHistoryEntryGet = new HistoryEntryGet();
export const CommandHistoryEntryAdd = new HistoryEntryAdd();
