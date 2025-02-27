import { HOUR, MINUTE } from "@/constants";
import { StateEnum } from "../../globalConstants";

export function checkInRange(value: string, min: number, max: number): boolean {
  if (typeof value !== "string" || value.trim() === "" || isNaN(value as any)) {
    return false;
  }
  const number = parseInt(value);
  return number >= min && number <= max;
}

export function getFormattedToday() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export const formatTimeStr = (time: number): string => {
  const hours = Math.trunc(time / HOUR);
  const minutes = Math.trunc((time % HOUR) / MINUTE);
  return `${hours > 0 ? hours + "小时" : ""}${minutes + "分钟"}`;
};

export function changeMainState(value: StateEnum): void {
  window.myIpcRenderer.changeMainState(value);
}
