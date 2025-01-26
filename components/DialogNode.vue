<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';

const props = defineProps<{
    data: {
        label: string,
        isRoot: boolean,
    },
    selected: boolean,
    id: string,
}>()

const inputfield = ref()

onMounted(() => {
    inputfield.value.innerText = props.data.label
})

</script>

<template>
    <div class="p-2 rounded bg-gray-300 cursor-move focus-within:outline outline-2 outline-blue-600">
        <div class="w-64 nodrag cursor-text outline-none" contenteditable="true" @input="props.data.label = inputfield.innerText" ref="inputfield"></div>
        <Handle type="target" v-if="!props.data.isRoot" :position="Position.Left" />
        <Handle type="source" :position="Position.Right" />
    </div>
</template>
