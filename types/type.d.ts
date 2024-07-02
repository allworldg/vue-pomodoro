import { MessageState, NotificationMessage } from "@/constants";
import { Ref } from "vue";
export interface StorageValue {
  tomatoes: string;
  rests: string;
  totalLoops: string;
}
export interface MusicItem {
  name: string | null;
  path: string | null;
}
export interface ImyIpcRenderer {
  saveLocalValue: (value: StorageValue) => Promise<void>;
  getLocalValue: () => Promise<Electron.Cookie[]>;
  notification: (value: NotificationMessage) => void;
  addLocalMusic: () => Promise<>;
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
