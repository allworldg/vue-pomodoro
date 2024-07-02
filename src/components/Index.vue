<script setup lang="ts">
import { inject, onMounted, ref, toValue } from "vue";
import Clock from "@/components/Clock.vue";
import InputItem from "@/components/InputItem.vue";
import StateTitle from "@/components/StateTitle.vue";
import {
  DEFAULT_RESTS,
  DEFAULT_LOOPS,
  DEFAULT_TOMATOES,
  State,
  MessageState,
  MINUTE,
  DEFAULT_CURRENT_LOOP,
  SECOND,
  NotificationMessage,
} from "@/constants";
import {
  asyncGetStorageValue,
  asyncSetStorageValue,
} from "@/utils/localStorage";
import { checkInRange } from "@/utils/util";
import { MessageData, MusicItem, StorageValue } from "@/../types/type";
import LoopTitle from "@/components/LoopTitle.vue";
const remainSeconds = ref<number>(0);
const audio = new Audio();
const tomato = ref<string>(DEFAULT_TOMATOES);
const rest = ref<string>(DEFAULT_RESTS);
const totalLoops = ref<string>(DEFAULT_LOOPS);
const state = ref<State>(State.STOP);
const curLoop = ref<number>(DEFAULT_CURRENT_LOOP);
const curMusicPath = ref<string>("");
const musicList = ref<Array<MusicItem>>([
  { name: "无", path: "" },
  {
    name: "forest",
    path: new URL("../../public/forest.mp4", import.meta.url).toString(),
  },
]);
const hasRest = ref<boolean>(false);

const worker = new Worker(new URL("../worker.ts", import.meta.url), {
  type: "module",
});
onMounted(() => {
  init();
});
async function init(): Promise<void> {
  asyncGetStorageValue().then((res) => {
    let obj = {} as StorageValue;
    if (res.length === 0) {
      obj = {
        tomatoes: DEFAULT_TOMATOES,
        rests: DEFAULT_RESTS,
        totalLoops: DEFAULT_LOOPS,
      };
      asyncSetStorageValue({
        ...obj,
      });
    } else {
      obj = JSON.parse(res[0].value);
    }
    tomato.value = obj.tomatoes;
    rest.value = obj.rests;
    totalLoops.value = obj.totalLoops;
  });
}
function start(): void {
  hasRest.value = parseInt(rest.value) !== 0;
  state.value = State.TOMATOE;
  customPostMessage({
    state: MessageState.START,
    data: { targetTime: parseInt(tomato.value) * SECOND + Date.now() },
  });
  worker.onmessage = (e: MessageEvent<MessageData>) => {
    const message = e.data;
    const mState = message.state;
    if (mState === MessageState.REMAIN_TEN_SECONDS) {
      playMusic();
    }
    if (mState === MessageState.RUNNING && message.data.remainTime) {
      remainSeconds.value = message.data.remainTime / SECOND;
      return;
    }
    if (mState === MessageState.STOP) {
      if (state.value === State.TOMATOE) {
        if (hasRest.value === true) {
          state.value = State.REST;
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(rest.value) * SECOND + Date.now() },
          });
          notification(NotificationMessage.REST);
        } else if (curLoop.value === parseInt(totalLoops.value)) {
          notification(NotificationMessage.END);
          stop();
        } else {
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(tomato.value) * SECOND + Date.now() },
          });
          notification(NotificationMessage.WORK);
          curLoop.value++;
        }
        return;
      }
      if (state.value === State.REST) {
        if (curLoop.value === parseInt(totalLoops.value)) {
          notification(NotificationMessage.END);
          stop();
        } else {
          state.value = State.TOMATOE;
          curLoop.value++;
          notification(NotificationMessage.WORK);
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(tomato.value) * SECOND + Date.now() },
          });
        }
      }
    }
  };
}
function stop(): void {
  state.value = State.STOP;
  remainSeconds.value = 0;
  curLoop.value = DEFAULT_CURRENT_LOOP;
  audio.pause();
  audio.currentTime = 0;
}
function playMusic(): void {
  if (curMusicPath.value === "") {
    return;
  }
  audio.src = curMusicPath.value;
  audio.play();
  audio.onerror = (e) => {
    console.log(`audio get error:`, e);
    audio.pause();
    audio.currentTime = 0;
  };
}
function clearMusic() {
  console.log("do clear");
}
async function validateAndStore(): Promise<void> {
  if (
    checkInRange(tomato.value, 1, 9999) &&
    checkInRange(rest.value, 0, 9999) &&
    checkInRange(totalLoops.value, 1, 9999)
  ) {
    asyncSetStorageValue({
      tomatoes: tomato.value,
      rests: rest.value,
      totalLoops: totalLoops.value,
    });
  } else {
    init();
  }
}
function customPostMessage(message: MessageData) {
  worker.postMessage(message);
}
function notification(message: NotificationMessage) {
  window.myIpcRenderer.notification(message);
}
function handleSelectMusic(event: Event) {
  const optionList = event.target as HTMLSelectElement;
  const size = optionList.length;
  const index = optionList.selectedIndex;
  if (index === size - 1) {
    clearMusic();
    curMusicPath.value = "";
    return;
  }
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="flex flex-1 flex-col justify-center">
      <Clock :remain-seconds="remainSeconds"></Clock>
      <StateTitle
        v-show="state !== State.STOP"
        class="mt-2"
        :state="state"
      ></StateTitle>
      <LoopTitle
        v-show="state !== State.STOP"
        :cur-loop="curLoop"
        :total-loops="totalLoops"
      ></LoopTitle>
      <div class="flex flex-row mt-5">
        <div class="flex-1"></div>
        <div class="flex-1 flex flex-row justify-center">
          <svg
            v-if="state === State.STOP"
            @click="start"
            class="h-11 w-11"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M512 938.666667a426.666667 426.666667 0 1 1 426.666667-426.666667 426.666667 426.666667 0 0 1-426.666667 426.666667zM450.133333 305.92A42.666667 42.666667 0 0 0 384 341.333333v341.333334a42.666667 42.666667 0 0 0 66.133333 35.413333l256-170.666667a42.666667 42.666667 0 0 0 0-70.826666z"
              fill="#FFFFFF"
              p-id="1164"
            ></path>
            <path
              d="M512 938.666667a426.666667 426.666667 0 1 1 426.666667-426.666667 426.666667 426.666667 0 0 1-426.666667 426.666667zM450.133333 305.92A42.666667 42.666667 0 0 0 384 341.333333v341.333334a42.666667 42.666667 0 0 0 66.133333 35.413333l256-170.666667a42.666667 42.666667 0 0 0 0-70.826666z"
              fill="#0C66FF"
              p-id="1165"
            ></path>
          </svg>
          <svg
            v-else
            class="h-11 w-11"
            viewBox="0 0 1024 1024"
            @click="
              () => {
                customPostMessage({ state: MessageState.STOP, data: {} });
                stop();
              }
            "
          >
            <path
              d="M512 938.666667a426.666667 426.666667 0 1 1 426.666667-426.666667 426.666667 426.666667 0 0 1-426.666667 426.666667zM395.52 356.693333a38.826667 38.826667 0 0 0-38.826667 38.826667v232.533333a38.826667 38.826667 0 0 0 38.826667 38.826667h232.533333a38.826667 38.826667 0 0 0 38.826667-38.826667V395.52a38.826667 38.826667 0 0 0-38.826667-38.826667z"
              fill="#FFFFFF"
              p-id="1014"
            ></path>
            <path
              d="M512 938.666667a426.666667 426.666667 0 1 1 426.666667-426.666667 426.666667 426.666667 0 0 1-426.666667 426.666667zM395.52 356.693333a38.826667 38.826667 0 0 0-38.826667 38.826667v232.533333a38.826667 38.826667 0 0 0 38.826667 38.826667h232.533333a38.826667 38.826667 0 0 0 38.826667-38.826667V395.52a38.826667 38.826667 0 0 0-38.826667-38.826667z"
              fill="#0C66FF"
              p-id="1015"
            ></path>
          </svg>
        </div>
        <div class="flex-1"></div>
      </div>
    </div>
    <div class="flex flex-1 flex-col">
      <div class="flex-1 flex justify-center flex-wrap">
        <InputItem
          class="mx-2"
          title="番茄"
          unit="分钟"
          :value="tomato"
          @update="(value:string)=>{tomato = value;validateAndStore()}"
        ></InputItem>
        <InputItem
          class="mx-2"
          title="休息"
          unit="分钟"
          :value="rest"
          @update="(value:string)=>{rest = value;validateAndStore()}"
        ></InputItem>
        <InputItem
          class="mx-2"
          title="循环"
          unit="次&nbsp;&nbsp;&nbsp;"
          :value="totalLoops"
          @update="(value:string)=>{totalLoops = value;validateAndStore()}"
        ></InputItem>
      </div>
      <div class="flex justify-center grow" >
        <div>
          <a
            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="#/"
            @click="() => {}"
            >添加本地音乐</a
          >
        </div>
        <div class="">
          <select
            v-model="curMusicPath"
            @change="handleSelectMusic"
            class="max-w-32 text-ellipsis overflow-hidden border-2 border-black"
          >
            <option
              v-for="item in musicList"
              :key="item.path!"
              :value="item.path"
            >
              {{ item.name }}
            </option>
            <option value="clear">清除音乐</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
