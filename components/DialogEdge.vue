<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow, type GraphEdge } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    sourceX: {
        type: Number,
        required: true,
    },
    sourceY: {
        type: Number,
        required: true,
    },
    targetX: {
        type: Number,
        required: true,
    },
    targetY: {
        type: Number,
        required: true,
    },
    sourcePosition: {
        type: String,
        required: true,
    },
    targetPosition: {
        type: String,
        required: true,
    },
    markerEnd: {
        type: String,
        required: false,
    },
    style: {
        type: Object,
        required: false,
    },
    data: {
        type: Object,
        required: true,
    },
    selected: {
        type: Boolean,
        required: false,
    }
})

const { addSelectedEdges, removeEdges } = useVueFlow()

const path = computed(() => getBezierPath(props as any))

const inputfield = ref()

onMounted(() => {
    inputfield.value.innerText = props.data.label
})
</script>

<script lang="ts">
export default {
    inheritAttrs: false,
}
</script>

<template>
    <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
    <BaseEdge :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" :stroke="props.selected ? 'green' : ''" />

    <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
    <EdgeLabelRenderer>
        <div :style="{
            pointerEvents: 'all',
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        }" @focusin="addSelectedEdges([props as any])"
            class="nodrag nopan focus-within:outline outline-2 outline-green-600 rounded"
            :class="props.selected ? ' z-10 outline' : ''">
            <div contenteditable="true" @input="props.data.label = inputfield.innerText" ref="inputfield"
                class="min-w-12 max-w-64 text-center p-2 bg-blue-400 rounded cursor-text outline-none"></div>

                <div @click="removeEdges([props as any])" v-if="props.selected" class="absolute h-4 w-4 rounded-full bg-red-500 -top-2 -right-2 flex place-items-center justify-center text-xs cursor-pointer">
                    X
                </div>
        </div>
    </EdgeLabelRenderer>
</template>
