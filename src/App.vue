<script setup lang="ts">
import { onMounted, ref } from "vue";
import Clock from "@/components/Clock.vue";
import InputItem from "@/components/InputItem.vue";
import StateTitle from "@/components/StateTitle.vue";
import {
  DEFAULT_RESTS,
  DEFAULT_TIMES,
  DEFAULT_TOMATOES,
  State,
} from "./constants";
import {
  asyncGetStorageValue,
  asyncSetStorageValue,
} from "./utils/localStorage";
import { checkInRange } from "./utils/util";
import { StorageValue } from "../types/type";
const remainSeconds = ref<number>(0);
const tomatoes = ref<string>(DEFAULT_TOMATOES);
const rests = ref<string>(DEFAULT_RESTS);
const times = ref<string>(DEFAULT_TIMES);
const state = ref<State>(State.STOP);
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
        times: DEFAULT_TIMES,
      };
      asyncSetStorageValue({
        ...obj,
      });
    } else {
      obj = JSON.parse(res[0].value);
    }
    tomatoes.value = obj.tomatoes;
    rests.value = obj.rests;
    times.value = obj.times;
  });
}
async function validateAndStore(): Promise<void> {
  if (
    checkInRange(tomatoes.value, 1, 9999) &&
    checkInRange(rests.value, 0, 9999) &&
    checkInRange(times.value, 1, 9999)
  ) {
    asyncSetStorageValue({
      tomatoes: tomatoes.value,
      rests: rests.value,
      times: times.value,
    });
  } else {
    init();
  }
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="flex flex-1 flex-col justify-center">
      <Clock :remain-seconds="123"></Clock>
      <StateTitle class="mt-2" :state="State.TOMATOE"></StateTitle>
      <div class="flex flex-row mt-5">
        <div class="flex-1"></div>
        <div class="flex-1 flex flex-row justify-center">
          <svg
            v-if="state === State.STOP"
            class="h-12 w-12"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M510.3 98.2c-229.2 0-415.1 185.8-415.1 415S281 928.3 510.3 928.3s415.1-185.8 415.1-415.1c0-229.2-185.9-415-415.1-415z m163.8 448.1L446.5 679.1c-3.3 1.9-6.7 2.8-10.1 2.8-10.5 0-20.1-8.4-20.1-20.1V396.2c0-11.7 9.6-20.1 20.1-20.1 3.4 0 6.8 0.9 10.1 2.8l227.6 132.8c13.3 7.7 13.3 26.9 0 34.6z"
              fill="#3259CE"
            />
          </svg>
          <svg v-else class="h-12 w-12" viewBox="0 0 1024 1024">
            <path
              d="M512 42.666667C252.793333 42.666667 42.666667 252.793333 42.666667 512s210.126667 469.333333 469.333333 469.333333 469.333333-210.126667 469.333333-469.333333S771.206667 42.666667 512 42.666667z m213.333333 645.333333a37.373333 37.373333 0 0 1-37.333333 37.333333H336a37.373333 37.373333 0 0 1-37.333333-37.333333V336a37.373333 37.373333 0 0 1 37.333333-37.333333h352a37.373333 37.373333 0 0 1 37.333333 37.333333z"
              fill="#2F54EB"
            />
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
          :value="tomatoes"
          @update="(value:string)=>{tomatoes = value;validateAndStore()}"
        ></InputItem>
        <InputItem
          class="mx-2"
          title="休息"
          unit="分钟"
          :value="rests"
          @update="(value:string)=>{rests = value;validateAndStore()}"
        ></InputItem>
        <InputItem
          class="mx-2"
          title="循环"
          unit="次"
          :value="times"
          @update="(value:string)=>{times = value;validateAndStore()}"
        ></InputItem>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
