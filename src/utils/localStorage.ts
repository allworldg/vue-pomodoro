import { StorageValue } from "../../types/type";

export async function asyncGetStorageValue(): Promise<Electron.Cookie[]> {
  return window.myIpcRenderer.getLocalValue();
}
export async function asyncSetStorageValue(value: StorageValue) {
  return window.myIpcRenderer.saveLocalValue(value);
}
