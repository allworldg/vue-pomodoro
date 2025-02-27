<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Clock from "@/components/Clock.vue";
import InputItem from "@/components/InputItem.vue";
import StateTitle from "@/components/StateTitle.vue";
import Worker from "@/worker.ts?worker";
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
  DEFAULT_TODAY_FOCUSTIMES,
  DEFAULT_TODAY_FOCUSTIME,
  DEFAULT_TOTAL_TIME_RECORD,
} from "@/constants";
import {
  asyncAddLocalMusicValue,
  asyncGetFocusRecord,
  asyncGetLocalInputValue,
  asyncGetLocalMusicValue,
  asyncSetLocalInputValue,
  asyncSetLocalMusicValue,
  clearMusicValue,
  saveRecordTime,
} from "@/utils/localStorage";
import { changeMainState, checkInRange, formatTimeStr } from "@/utils/util";
import { MessageData, MusicItem } from "@/../types/type";
import LoopTitle from "@/components/LoopTitle.vue";
import { StateEnum } from "../../globalConstants";
const remainSeconds = ref<number>(0);
const audio = new Audio();
const tomato = ref<string>(DEFAULT_TOMATOES);
const rest = ref<string>(DEFAULT_RESTS);
const totalLoops = ref<string>(DEFAULT_LOOPS);
const state = ref<State>(State.STOP);
const curLoop = ref<number>(DEFAULT_CURRENT_LOOP);
const curMusicPath = ref<string>("");
const musicList = ref<Array<MusicItem>>([]);
const hasRest = ref<boolean>(false);
const todayFocusTimes = ref<number>(DEFAULT_TODAY_FOCUSTIMES);
const todayFocusTime = ref<number>(DEFAULT_TODAY_FOCUSTIME);
const todayFocusTimeStr = computed(() => formatTimeStr(todayFocusTime.value));
const totalTimeRecord = ref<number>(DEFAULT_TOTAL_TIME_RECORD);
const totalTimeStr = computed(() => formatTimeStr(totalTimeRecord.value));

const worker = new Worker();
onMounted(() => {
  init();
});
async function init(): Promise<void> {
  asyncGetLocalInputValue().then((res) => {
    tomato.value = res.tomatoes;
    rest.value = res.rests;
    totalLoops.value = res.totalLoops;
  });
  asyncGetLocalMusicValue().then((res) => {
    musicList.value = res.musicList;
    curMusicPath.value = res.curMusicPath;
  });
  asyncGetFocusRecord().then((res) => {
    todayFocusTime.value = res.todayFocus.todayFocusTime;
    todayFocusTimes.value = res.todayFocus.todayFocusTimes;
    totalTimeRecord.value = res.totalFocusTime;
  });
}

function start(): void {
  hasRest.value = parseInt(rest.value) !== 0;
  state.value = State.TOMATOE;
  customPostMessage({
    state: MessageState.START,
    data: { targetTime: parseInt(tomato.value) * MINUTE + Date.now() },
  });
  changeMainState(StateEnum.WORKING);
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
      audio.pause();
      audio.currentTime = 0;
      if (state.value === State.TOMATOE) {
        let focusTime = parseInt(tomato.value) * MINUTE;
        saveRecordTime(focusTime).then(() => {
          asyncGetFocusRecord().then((res) => {
            todayFocusTime.value = res.todayFocus.todayFocusTime;
            todayFocusTimes.value = res.todayFocus.todayFocusTimes;
            totalTimeRecord.value = res.totalFocusTime;
          });
        });

        if (hasRest.value === true) {
          state.value = State.REST;
          changeMainState(StateEnum.RESTING);
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(rest.value) * MINUTE + Date.now() },
          });
          notification(NotificationMessage.REST);
        } else if (curLoop.value === parseInt(totalLoops.value)) {
          notification(NotificationMessage.END);
          stop();
          changeMainState(StateEnum.END);
        } else {
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(tomato.value) * MINUTE + Date.now() },
          });
          notification(NotificationMessage.WORK);
          changeMainState(StateEnum.WORKING);
          curLoop.value++;
        }
        return;
      }
      if (state.value === State.REST) {
        if (curLoop.value === parseInt(totalLoops.value)) {
          notification(NotificationMessage.END);
          stop();
          changeMainState(StateEnum.END);
        } else {
          state.value = State.TOMATOE;
          curLoop.value++;
          notification(NotificationMessage.WORK);
          customPostMessage({
            state: MessageState.START,
            data: { targetTime: parseInt(tomato.value) * MINUTE + Date.now() },
          });
          changeMainState(StateEnum.WORKING);
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
async function validateAndStore(): Promise<void> {
  if (
    checkInRange(tomato.value, 1, 9999) &&
    checkInRange(rest.value, 0, 9999) &&
    checkInRange(totalLoops.value, 1, 9999)
  ) {
    asyncSetLocalInputValue({
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
    clearMusicValue().then((res) => {
      curMusicPath.value = res.curMusicPath;
      musicList.value = res.musicList;
    });
  }
  asyncSetLocalMusicValue({
    curMusicPath: curMusicPath.value,
    musicList: musicList.value,
  });
}
function handleAddLocalMusic() {
  asyncAddLocalMusicValue().then((value) => {
    if (value !== null) {
      if (value.name.length >= 11) {
        value.name = `...${value.name?.slice(-11)}`;
      }
      musicList.value.push(value);
      curMusicPath.value = value.path;
      asyncSetLocalMusicValue({
        musicList: musicList.value,
        curMusicPath: curMusicPath.value,
      });
    }
  });
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <section class="flex flex-1 flex-col justify-center">
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
                changeMainState(StateEnum.END);
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
    </section>
    <section class="flex flex-1 flex-col">
      <section class="flex-1 flex justify-center flex-wrap">
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
      </section>

      <section class="flex flex-1 justify-center">
        <div>
          <a
            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="#/"
            @click="handleAddLocalMusic"
            >添加本地音乐</a
          >
        </div>
        <div class="mx-4">
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
      </section>
      <section class="flex flex-1 flex-col">
        <div class="flex flex-1">
          <div class="mx-10">
            <span>当日专注次数：</span>
            <span>{{ todayFocusTimes }}</span>
          </div>
          <div>
            <span>时长：</span>
            <span>{{ todayFocusTimeStr }}</span>
          </div>
        </div>
        <div class="flex flex-1">
          <section class="flex">
            <div class="mx-10">
              <span>总时长：</span>
              <span>{{ totalTimeStr }}</span>
            </div>
          </section>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped></style>
