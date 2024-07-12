import { MessageState, NotificationMessage } from "@/constants";
import { promises } from "dns";
import { Ref } from "vue";
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
  saveInputValue: (value: LocalInputValue) => void;
  getInputValue: () => Promise<LocalInputValue>;
  notification: (value: NotificationMessage) => void;
  saveMusicValue: (value: LocalMusicValue) => void;
  clearMusicValue: () => Promise<LocalMusicValue>;
  getMusicValue: () => Promise<LocalMusicValue>;
  addLocalMusic: () => Promise<MusicItem>;
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
