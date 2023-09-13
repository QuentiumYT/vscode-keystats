import { Memento } from 'vscode';
import { KeyData } from './types';

class LocalStorage {
  constructor(private storage: Memento) { }

  public getValue<T>(key: string, def: T): T {
    return this.storage.get<T>(key, def);
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value);
  }

  public deleteValue(key: string) {
    this.storage.update(key, undefined);
  }
}

class KeysList {
  private static readonly key = 'keyStatsData';
  public data: KeyData = { total: 0, dates: {} };

  constructor(private storage: LocalStorage) { }

  public load() {
    this.data = this.storage.getValue<KeyData>(KeysList.key, this.data);
    return this.data;
  }

  public save() {
    this.storage.setValue(KeysList.key, this.data);
  }
}

export { LocalStorage, KeysList };
