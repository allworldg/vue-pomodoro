export interface StorageValue {
  tomatoes: string;
  rests: string;
  times: string;
}
export interface ImyIpcRenderer {
  saveLocalValue: (value: StorageValue) => Promise<void>;
  getLocalValue: () => Promise<Electron.Cookie[]>;
}

declare global {
  interface Window {
    myIpcRenderer: ImyIpcRenderer;
  }
}
