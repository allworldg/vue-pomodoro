import { LocalInputValue, LocalMusicValue, MusicItem } from "../../types/type";

export async function asyncGetLocalInputValue(): Promise<LocalInputValue> {
  return window.myIpcRenderer.getInputValue().then((value) => {
    return JSON.parse(value);
  });
}
export async function asyncSetLocalInputValue(value: LocalInputValue) {
  return window.myIpcRenderer.saveInputValue(JSON.stringify(value));
}

export async function asyncSetLocalMusicValue(
  value: LocalMusicValue
): Promise<void> {
  return window.myIpcRenderer.saveMusicValue(JSON.stringify(value));
}

export async function asyncGetLocalMusicValue(): Promise<LocalMusicValue> {
  return window.myIpcRenderer
    .getMusicValue()
    .then((value) => JSON.parse(value));
}

export async function clearMusicValue(): Promise<LocalMusicValue> {
  return window.myIpcRenderer
    .clearMusicValue()
    .then((value) => JSON.parse(value));
}
export async function asyncGetMusicvalue(): Promise<LocalMusicValue> {
  return window.myIpcRenderer
    .getMusicValue()
    .then((value) => JSON.parse(value));
}
export async function asyncAddLocalMusicValue(): Promise<MusicItem> {
  return window.myIpcRenderer
    .addLocalMusic()
    .then((value) => JSON.parse(value));
}
