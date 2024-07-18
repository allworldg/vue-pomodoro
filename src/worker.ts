import { MessageData } from "@/../types/type";
import { MessageState, SECOND } from "@/constants";

let hasSendRemainTenSeconds = false;
let timeId: NodeJS.Timeout;

onmessage = (e: MessageEvent<MessageData>) => {
  const message = e.data;
  if (message.state === MessageState.START) {
    timeId = setTimeout(() => {
      let targetTime = message.data.targetTime!;
      customPostMessage({
        state: MessageState.RUNNING,
        data: { remainTime: targetTime - Date.now() },
      });
      countDown(targetTime);
    }, 10);
  } else if (message.state === MessageState.STOP) {
    stop();
  }
};
function countDown(targetTime: number) {
  const remainTime = targetTime - Date.now();
  if (remainTime > 0) {
    if (remainTime <= 10 * SECOND && !hasSendRemainTenSeconds) {
      hasSendRemainTenSeconds = true;
      customPostMessage({ state: MessageState.REMAIN_TEN_SECONDS, data: {} });
    }
    customPostMessage({
      state: MessageState.RUNNING,
      data: { remainTime: remainTime },
    });
    timeId = setTimeout(() => {
      countDown(targetTime);
    }, 200);
  } else {
    customPostMessage({
      state: MessageState.STOP,
      data: {},
    });
    stop();
    return;
  }
}
function stop() {
  clearTimeout(timeId);
  hasSendRemainTenSeconds = false;
}
function customPostMessage(message: MessageData) {
  postMessage(message);
}
