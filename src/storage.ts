import { Memento } from 'vscode';

type KeyCount = {
  [key: string]: number;
};

class LocalStorage {
  constructor(private storage: Memento) { }

  public getValue<T>(key: string, def: T): T {
    return this.storage.get<T>(key, def);
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value);
  }
}

class KeysList {
  private static readonly key = 'keysList';
  public buffer: KeyCount = {};

  constructor(private storage: LocalStorage) { }

  public load() {
    this.buffer = this.storage.getValue<KeyCount>(KeysList.key, this.buffer);
    return this.buffer;
  }

  public save() {
    this.storage.setValue(KeysList.key, this.buffer);
  }
}

export { LocalStorage, KeysList };
