import * as vscode from 'vscode';
import { LocalStorage, KeysList } from './storage';
import { getDate } from './utils';

let date = getDate();
let project = vscode.workspace.name || 'Unknown Project';
let file = 'Unnamed File';

let statusBarLabel: vscode.StatusBarItem;

let timeoutHandle: NodeJS.Timeout;

let totalKeypressCount: number = 0;
let consecutiveKeypressCount: number = 0;

let keysList: KeysList;

export function activate(context: vscode.ExtensionContext) {
  const storage: LocalStorage = new LocalStorage(context.globalState);
  keysList = new KeysList(storage);
  keysList.load();

  statusBarLabel = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarLabel.show();
  context.subscriptions.push(statusBarLabel);

  totalKeypressCount = keysList.data.total;

  updateStats();

  setInterval(() => {
    keysList.save();
  }, 6000);

  // Register event listeners
  vscode.workspace.onDidChangeTextDocument((event) => {
    onKeyPressed(event, keysList);
  });

  vscode.window.onDidChangeActiveTextEditor((event) => {
    onProjectChange(event);
  });
};

const onKeyPressed = (event: vscode.TextDocumentChangeEvent, keysList: KeysList) => {
  if (!event.contentChanges) {
    return;
  }
  const eventText = event.contentChanges[0].text;

  let { data } = keysList;

  if (!data) {
    data = {
      dates: {},
      total: 0,
    };
  }

  let { dates } = keysList.data;
  if (!dates || !dates[date]) {
    dates[date] = {
      projects: {},
      global: 0,
    };
  }

  let { projects } = dates[date];
  if (!projects || !projects[project]) {
    projects[project] = {
      keys: {},
      special: 0,
    };
  }

  let { keys } = projects[project];
  if (!keys) {
    keys = {};
  }
  if (!keys[eventText]) {
    keys[eventText] = 0;
  }
  switch (eventText) {
    case '':
      data.total++;
      dates[date].global++;
      projects[project].special++;
      break;

    case ' ':
      data.total++;
      dates[date].global++;
      keys['space']++;
      break;

    case '\n' || '\r' || '\r\n':
      data.total++;
      dates[date].global++;
      keys['enter']++;
      break;

    case '\t' || '\n\t' || '\r\t' || '\r\n\t':
      data.total++;
      dates[date].global++;
      keys['tab']++;
      break;

    default:
      data.total++;
      dates[date].global++;
      keys[eventText]++;
      break;
  }

  projects[project].keys = keys;
  dates[date].projects = projects;
  data.dates = dates;

  keysList.data = data;

  consecutiveKeypressCount++;
  updateStats();

  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
  }
  timeoutHandle = setTimeout(() => {
    totalKeypressCount += consecutiveKeypressCount;
    consecutiveKeypressCount = 0;
    updateStats();
  }, 3000);
};

const onProjectChange = (event: vscode.TextEditor | undefined) => {
  project = vscode.workspace.name || 'Unknown Project';
  if (event) {
    file = event.document.fileName.split('/').pop() || 'Unnamed File';
  }

  consecutiveKeypressCount = 0;
};

const updateStats = () => {
  // Format totalKeypressCount as 1,234,567
  const formattedCount = totalKeypressCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  statusBarLabel.text = '$(flame)' + formattedCount + (consecutiveKeypressCount > 0 ? ` | ${consecutiveKeypressCount} combo` : '');
};

export function deactivate() {
  keysList.save();
}
