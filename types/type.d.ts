import { MessageState, NotificationMessage } from "@/constants";
import { promises } from "dns";
import { Ref } from "vue";
import { StateEnum } from "../globalConstants";
export interface LocalInputValue {
  tomatoes: string;
  rests: string;
  totalLoops: string;
}
export interface MusicItem {
  name: string;
  path: string;
}
export interface LocalMusicValue {
  curMusicPath: string;
  musicList: Array<MusicItem>;
}
export interface ImyIpcRenderer {
  saveInputValue: (value: string) => void;
  getInputValue: () => Promise<string>;
  notification: (value: string) => void;
  saveMusicValue: (value: string) => void;
  clearMusicValue: () => Promise<string>;
  getMusicValue: () => Promise<string>;
  addLocalMusic: () => Promise<string>;
  changeMainState: (value: StateEnum) => void;
}

export interface ContextValue {
  hasRest: Ref<boolean>;
  updateHasRest: (value: boolean) => void;
  isMusicPlaying: Ref<boolean>;
  updateIsMusicPlaying: (value: boolean) => void;
}

export interface MessageData {
  state: MessageState;
  data: {
    targetTime?: number;
    remainTime?: number;
  };
}

declare global {
  interface Window {
    myIpcRenderer: ImyIpcRenderer;
  }
}
