<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';

const props = defineProps<{
    data: {
        label: string,
        isRoot: boolean,
    },
    selected: boolean,
}>()

</script>

<template>
    <div class="custom-node-container p-2 rounded" :class="props.selected ? ' bg-green-500' : ' bg-red-500'">
        <textarea class="nodrag w-64" v-model="props.data.label"></textarea>
        <Handle type="target" v-if="!props.data.isRoot" :position="Position.Left"/>
        <Handle type="source" :position="Position.Right"/>
    </div>
</template>
