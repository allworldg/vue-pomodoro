<template>
  <div class="flex flex-row justify-center">
    <span class="text-lg mr-3 h-8">{{ title + ":" }}</span>
    <input
      class="h-7 w-14 text-center border border-gray-500 rounded-lg"
      :value="value"
      maxlength="4"
      @change="(e) => {
        $emit('update', (e.target as HTMLInputElement)!.value)
      }"
    />
    <span class="text-lg mx-1 h-8">{{ unit }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; unit: string; value: string }>();
const emits = defineEmits<{ update: [value: string] }>();
</script>

<style></style>
