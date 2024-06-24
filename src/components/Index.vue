<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
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
} from "@/constants";
import {
  asyncGetStorageValue,
  asyncSetStorageValue,
} from "@/utils/localStorage";
import { checkInRange } from "@/utils/util";
import { ContextValue, MessageData, StorageValue } from "@/../types/type";
const remainSeconds = ref<number>(0);
const audio = new Audio();
const tomato = ref<string>(DEFAULT_TOMATOES);
const rest = ref<string>(DEFAULT_RESTS);
const totalLoops = ref<string>(DEFAULT_LOOPS);
const state = ref<State>(State.STOP);
const curLoop = ref<number>(DEFAULT_CURRENT_LOOP);

const hasRest = ref<boolean>(false);
const worker = new Worker(new URL("../worker.ts", import.meta.url), {
  type: "module",
});
// const { hasRest, updateHasRest, isMusicPlaying, updateIsMusicPlaying } =
//   inject<ContextValue>(CONTEXY_KEY, {
//     hasRest: ref<boolean>(true),
//     updateHasRest: (_value: boolean) => {
//       console.error("cannot inject from contextValue");
//     },
//     isMusicPlaying: ref(false),
//     updateIsMusicPlaying: (_value: boolean) => {
//       console.error("cannot inject from contextValue");
//     },
//   });
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
    data: { targetTime: parseInt(tomato.value) * MINUTE + Date.now() },
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
      console.log("stop message get");
      console.log("hasrest: " + hasRest.value);
      console.log("curLoop: " + curLoop.value);
      if (state.value === State.TOMATOE) {
        if (hasRest.value === true) {
          state.value = State.REST;
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(rest.value + Date.now()) },
          });
        } else if (curLoop.value === parseInt(totalLoops.value)) {
          stop();
        } else {
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(tomato.value) * MINUTE + Date.now() },
          });
          curLoop.value++;
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
function playMusic(): void {}
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
  if (worker != null) {
    worker.postMessage(message);
  } else {
    console.error("worker is null");
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
        :state="State.TOMATOE"
      ></StateTitle>
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
        <div class="flex-1">
          <select>
            <option>test1</option>
            <option>test2</option>
          </select>
        </div>
      </div>
    </div>
    <div class="flex flex-1 flex-col">
      <div class="flex-1 flex flex-wrap justify-center content-start">
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
          unit="次"
          :value="totalLoops"
          @update="(value:string)=>{totalLoops = value;validateAndStore()}"
        ></InputItem>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
