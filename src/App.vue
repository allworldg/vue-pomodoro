<script setup lang="ts">
import Clock from "./components/Clock.vue";
import StateTitle from "./components/StateTitle.vue";
</script>

<template>
  <div class="flex flex-col w-screen h-screen">
    <div class="flex flex-1 justify-center">
      <Clock :remain-seconds="123"></Clock>
      <StateTitle></StateTitle>
    </div>
    <div class="flex flex-1">
      <div class="flex flex-1"></div>
      <div class="flex flex-1"></div>
    </div>
  </div>
</template>

<style scoped></style>
