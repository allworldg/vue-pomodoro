<template>
  <div class="flex items-center">
    <span class="text-5xl">{{ formatTime }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ remainSeconds: number }>();
const formatTime = computed(() => {
  const minutes = Math.trunc(props.remainSeconds / 60);
  const seconds = Math.trunc(props.remainSeconds % 60);
  return `${minutes}:${seconds}`;
});
</script>

<style></style>
