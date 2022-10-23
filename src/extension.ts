import * as vscode from 'vscode';
import { LocalStorage, KeysList } from './storage';

export function activate(context: vscode.ExtensionContext) {
  const storage: LocalStorage = new LocalStorage(context.globalState);
  const keysList: KeysList = new KeysList(storage);

  const label = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  label.show();
  context.subscriptions.push(label);

  let totalKeypressCount: number = storage.getValue<number>('totalKeypressCount', 0);
  let consecutiveKeypressCount: number = 0;
  let timeoutComboHandle: NodeJS.Timeout;
  let timeoutSaveHandle: NodeJS.Timeout;

  const updateLabel = () => {
    // Format totalKeypressCount as 1,234,567
    const formattedCount = totalKeypressCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    label.text = '$(flame)' + formattedCount + (consecutiveKeypressCount > 0 ? ` | ${consecutiveKeypressCount} combo` : '');
  };
  updateLabel();

  keysList.load();

  const onKeyPressed = (event: vscode.TextDocumentChangeEvent) => {
    const keyEventText = event.contentChanges[0].text;
    if (keyEventText.length === 1) {
      const key = keyEventText.toLowerCase();
      if (keysList.buffer[key] !== undefined) {
        keysList.buffer[key]++;
      } else {
        keysList.buffer[key] = 1;
      }
    }

    consecutiveKeypressCount++;
    updateLabel();

    if (timeoutComboHandle) {
      clearTimeout(timeoutComboHandle);
    }
    timeoutComboHandle = setTimeout(() => {
      onConsecutiveEnded();
    }, 3000);

    if (timeoutSaveHandle) {
      clearTimeout(timeoutSaveHandle);
    }
    timeoutSaveHandle = setTimeout(() => {
      keysList.save();
    }, 5000);
  };

  const onConsecutiveEnded = () => {
    totalKeypressCount = storage.getValue<number>('totalKeypressCount', 0);
    totalKeypressCount += consecutiveKeypressCount;
    storage.setValue('totalKeypressCount', totalKeypressCount);
    consecutiveKeypressCount = 0;
    updateLabel();
  };

  vscode.workspace.onDidChangeTextDocument(event => {
    onKeyPressed(event);
  });
};

export function deactivate() { }
