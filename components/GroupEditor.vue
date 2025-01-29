<template>
    <div div class="flex flex-col w-full gap-2">
        <div class="flex w-full justify-between">
            <h1>Groups</h1>
            <button @click="groups?.groups.push(newGroup())" class="bg-gray-300 px-2 rounded">+</button>
        </div>
        <div class="w-full flex flex-col gap-2">
            <div v-for="group in groups?.groups" :key="group.id" class="relative">
                <button @click="selectGroup(group.id)" class="p-2 rounded w-full"
                    :class="selectedGroupId == group.id ? 'bg-green-600' : 'bg-gray-300'">
                    <input v-model="group.name" class="bg-transparent outline-none"></input>
                </button>
                <div v-if="group.id == selectedGroupId && group.id != groups?.mainGroupId"
                    @click="removeGroup(group.id)"
                    class="absolute h-4 w-4 rounded-full bg-red-500 -top-2 -right-2 flex place-items-center justify-center text-xs cursor-pointer">
                    X
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useVueFlow, type GraphEdge, type GraphNode } from '@vue-flow/core'
import { v4 } from 'uuid'
import type { Group } from '~/types'


const groups = useGroups()
const selectedGroupId = useSelectedGroupId()
const { getEdges, getNodes, getViewport } = useVueFlow()

// helper to spawn a new node
function newNode(): GraphNode {
    const viewport = getViewport()
    return {
        id: v4(),
        position: { x: (200 - viewport.x) / viewport.zoom, y: (200 - viewport.y) / viewport.zoom },
        data: { label: "" },
        type: "dialog"
    } as GraphNode
}

// helper to add a group
function newGroup(): Group {
    const root = newNode()
    root.data.isRoot = true

    const name = "Group " + groups.value?.groups.length
    setTimeout(() => selectGroup(name), 0)

    return {
        id: v4(),
        name,
        root: root.id,
        flow: {
            nodes: [root] as GraphNode[],
            edges: [] as GraphEdge[]
        }
    }
}

// switches current flow
function selectGroup(id: string) {
    if (!groups.value) return
    let group = useSelectedGroup()

    if (group) {
        group.flow = {
            nodes: getNodes.value,
            edges: getEdges.value,
        }
    }

    selectedGroupId.value = id
}

// delete a group
function removeGroup(id: string) {
    if (!groups.value) return
    selectGroup(groups.value?.mainGroupId)
    groups.value.groups = groups.value.groups.filter((group) => group.id != id)
}

</script>
