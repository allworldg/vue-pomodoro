import { LocalInputValue, LocalMusicValue, MusicItem } from "../../types/type";

export async function asyncGetLocalInputValue(): Promise<LocalInputValue> {
  return window.myIpcRenderer.getInputValue();
}
export async function asyncSetLocalInputValue(value: LocalInputValue) {
  return window.myIpcRenderer.saveInputValue(value);
}
export async function asyncGetLocalMusicList(): Promise<LocalMusicValue> {
  return window.myIpcRenderer.getMusicValue();
}
