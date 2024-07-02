import { ipcRenderer, contextBridge, ipcMain } from "electron";
import {
  ADD_LOCAL_MUISC,
  GET_VALUE,
  NOTIFICATION,
  SAVE_VALUE,
} from "./constants";
import { StorageValue } from "../types/type";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("myIpcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  saveLocalValue(value: StorageValue) {
    return ipcRenderer.send(SAVE_VALUE, value);
  },
  getLocalValue() {
    return ipcRenderer.invoke(GET_VALUE).then((cookie) => cookie);
  },
  notification(value: string) {
    ipcRenderer.send(NOTIFICATION, value);
  },
  addLocalMusic() {
    return ipcRenderer.invoke(ADD_LOCAL_MUISC).then((value) => value);
  },
});
