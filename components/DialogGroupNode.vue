<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core';

const props = defineProps<{
    data: {
        group: string,
    },
    selected: boolean,
    id: string,
}>()

const { removeNodes } = useVueFlow()

const groups = useGroups()

</script>

<template>
    <div class="p-2 rounded bg-gray-300 cursor-move outline-2 outline-green-600"
        :class="props.selected ? ' outline' : ''">
        <select v-model="props.data.group" class="w-64 nodrag cursor-select outline-none bg-transparent">
            <option v-for="group in groups?.groups" :value="group.id">{{ group.name }}</option>
        </select>
        <Handle type="target" :position="Position.Left" />

        <div @click="removeNodes([props as any])" v-if="props.selected"
            class="absolute h-4 w-4 rounded-full bg-red-500 -top-2 -right-2 flex place-items-center justify-center text-xs cursor-pointer">
            X
        </div>
    </div>
</template>
