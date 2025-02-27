import { StateEnum } from "./../globalConstants";
import { FocusRecordData, LocalMusicValue } from "./../types/type.d";
import { ipcRenderer, contextBridge } from "electron";
import {
  ADD_LOCAL_MUISC,
  CHANGE_STATE,
  CLEAR_MUSIC_VALUE,
  GET_FOCUS_RECORD,
  GET_INPUT_VALUE,
  GET_MUISC_VALUE,
  NOTIFICATION,
  SAVE_FOCUS_RECORD,
  SAVE_INPUT_VALUE,
  SAVE_MUISC_LIST,
} from "./constants";

const myIpcRenderer = {
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
  changeMainState(value: StateEnum) {
    ipcRenderer.send(CHANGE_STATE, value);
  },
  saveFocusRecord(focusTime: number) {
    ipcRenderer.send(SAVE_FOCUS_RECORD, focusTime);
  },
  getFocusRecord() {
    return ipcRenderer.invoke(GET_FOCUS_RECORD);
  },
};
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("myIpcRenderer", myIpcRenderer);
export { myIpcRenderer };
