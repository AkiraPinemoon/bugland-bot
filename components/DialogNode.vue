<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core';

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

const { removeNodes } = useVueFlow()

function cleanPaste(payload: ClipboardEvent) {
    if (payload.clipboardData?.types.includes("text/plain")) return
    let text = inputfield.value.innerText
    setTimeout(() => inputfield.value.innerText = text, 0)
}


function blockDragDrop(ev: DragEvent) {
    ev.dataTransfer!.effectAllowed = 'none';
    ev.dataTransfer!.dropEffect = 'none';
    ev.preventDefault();
    return false;
}

</script>

<template>
    <div class="p-2 rounded bg-gray-300 cursor-move outline-2 outline-green-600"
        :class="props.selected ? ' outline' : ''">
        <div class="w-64 nodrag cursor-text outline-none" contenteditable="true" @paste="cleanPaste" @dragstart="blockDragDrop" @dragover="blockDragDrop"
            @input="props.data.label = inputfield.innerText" ref="inputfield"></div>
        <Handle type="target" v-if="!props.data.isRoot" :position="Position.Left" />
        <Handle type="source" :position="Position.Right" />

        <div @click="removeNodes([props as any])" v-if="props.selected && !props.data.isRoot"
            class="absolute h-4 w-4 rounded-full bg-red-500 -top-2 -right-2 flex place-items-center justify-center text-xs cursor-pointer">
            X
        </div>
    </div>
</template>
