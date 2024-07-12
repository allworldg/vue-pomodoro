import { LocalMusicValue } from "./../types/type.d";
import { ipcRenderer, contextBridge, ipcMain } from "electron";
import {
  ADD_LOCAL_MUISC,
  CLEAR_MUSIC_VALUE,
  GET_INPUT_VALUE,
  GET_MUISC_VALUE,
  NOTIFICATION,
  SAVE_INPUT_VALUE,
  SAVE_MUISC_LIST,
} from "./constants";
import { ImyIpcRenderer, LocalInputValue } from "../types/type";

const myIpcRenderer: ImyIpcRenderer = {
  saveInputValue(value: string) {
    return ipcRenderer.send(SAVE_INPUT_VALUE, value);
  },
  getInputValue() {
    return ipcRenderer.invoke(GET_INPUT_VALUE);
  },
  notification(value: string) {
    ipcRenderer.send(NOTIFICATION, value);
  },
  saveMusicValue(value: string) {
    ipcRenderer.send(SAVE_MUISC_LIST, value);
  },
  getMusicValue() {
    return ipcRenderer.invoke(GET_MUISC_VALUE);
  },
  addLocalMusic() {
    return ipcRenderer.invoke(ADD_LOCAL_MUISC);
  },
  clearMusicValue() {
    return ipcRenderer.invoke(CLEAR_MUSIC_VALUE);
  },
};
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("myIpcRenderer", myIpcRenderer);
