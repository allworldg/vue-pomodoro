<template>
  <div class="flex justify-center">
    <span v-if="state === State.TOMATOE" class="text-2xl">{{ WORKING }}</span>
    <span v-else-if="state === State.REST" class="text-2xl">
      {{ RESTING }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { RESTING, State, WORKING } from "../constants";
defineProps<{ state: State }>();
</script>

<style></style>
