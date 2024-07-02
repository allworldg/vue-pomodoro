import { ContextValue } from "./../types/type.d";
import { InjectionKey } from "vue";
export enum State {
  TOMATOE = "TOMATOE",
  REST = "REST",
  STOP = "STOP",
}
export enum MessageState {
  START = "0",
  STOP = "1",
  RUNNING = "2",
  END = "3",
  REMAIN_TEN_SECONDS = "4",
}

export enum NotificationMessage {
  WORK = "开始工作",
  REST = "开始休息",
  END = "结束",
}

export const DEFAULT_TOMATOES = "5";
export const DEFAULT_RESTS = "0";
export const DEFAULT_LOOPS = "1";
export const STARTED = true;
export const DEFAULT_CURRENT_LOOP = 1;
export const WORKING = "正在专注";
export const RESTING = "正在休息";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export const NOTIFICATION_BODY_START_WORK = "开始专注";
export const NOTIFICATION_BODY_START_REST = "开始休息";
export const NOTIFICATION_BODY_END = "全部结束";

export const CONTEXY_KEY = Symbol("contextKey") as InjectionKey<ContextValue>;
