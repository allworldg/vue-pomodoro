<template>
  <div class="flex justify-center text-lg">
    <span>当前第{{ curLoop }}轮/</span>
    <span>共{{totalLoops}}轮</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ curLoop: number; totalLoops: string }>();
</script>

<style></style>
