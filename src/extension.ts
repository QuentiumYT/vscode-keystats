import * as vscode from 'vscode';
import { Memento } from 'vscode';

class LocalStorage {
  constructor(private storage: Memento) { }

  public getValue<T>(key: string, def: T): T {
    return this.storage.get<T>(key, def);
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const storage: LocalStorage = new LocalStorage(context.globalState);

  const label = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  label.show();
  context.subscriptions.push(label);

  let totalKeypressCount: number = storage.getValue<number>('totalKeypressCount', 0);
  let consecutiveKeypressCount: number = 0;
  let timeoutHandle: NodeJS.Timeout;

  const updateLabel = () => {
    // Format totalKeypressCount as 1,234,567
    const formattedCount = totalKeypressCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    label.text = '$(flame)' + formattedCount + (consecutiveKeypressCount > 0 ? ` | ${consecutiveKeypressCount} combo` : '');
  };
  updateLabel();

  const onKeyPressed = () => {
    consecutiveKeypressCount++;
    updateLabel();

    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    timeoutHandle = setTimeout(() => {
      onConsecutiveEnded();
    }, 3000);
  };

  const onConsecutiveEnded = () => {
    totalKeypressCount = storage.getValue<number>('totalKeypressCount', 0);
    totalKeypressCount += consecutiveKeypressCount;
    storage.setValue('totalKeypressCount', totalKeypressCount);
    consecutiveKeypressCount = 0;
    updateLabel();
  };

  vscode.workspace.onDidChangeTextDocument(event => {
    onKeyPressed();
  });
}

export function deactivate() { }
