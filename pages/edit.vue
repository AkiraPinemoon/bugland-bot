<template>
    <div class="w-full h-screen flex flex-col">
        <ClientOnly>
            <VueFlow :nodes="nodes" :edges="edges" class="w-full grow" :nodeTypes="nodeTypes" :edgeTypes="edgeTypes">
                <MiniMap pannable />

                <div class="absolute top-2 left-2 p-2 flex flex-col gap-2">
                    <button @click="flowToDb()"
                        class="p-2 rounded z-10 bg-gray-800 bg-opacity-50 backdrop-blur-sm">Save</button>

                    <button @click="addNodes(newNode())"
                        class="p-2 rounded z-10 bg-gray-800 bg-opacity-50 backdrop-blur-sm">Add Node</button>
                    <button @click="topologicalSort()"
                        class="p-2 rounded z-10 bg-gray-800 bg-opacity-50 backdrop-blur-sm">Auto Arrange</button>
                </div>
            </VueFlow>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { MarkerType, useVueFlow, type Connection, type GraphEdge, type GraphNode } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { v4 } from 'uuid';
import DialogEdge from '~/components/DialogEdge.vue';
import DialogNode from '~/components/DialogNode.vue';

// fetch db dump and convert to flow
async function flowFromDb() {
    let data = await $fetch("/api/dump");
    const nodes = data.message.map((message) => {
        return {
            id: message.message_id,
            position: { x: 100, y: 100 },
            data: { label: message.message_text, isRoot: false },
            type: "dialog",
        }
    })

    const edges = data.responses.map((response) => {
        return {
            id: response.message_id + response.response_id,
            source: response.message_id,
            target: response.response_id,
            data: { label: response.response_text },
            markerEnd: MarkerType.ArrowClosed,
            type: "dialog",
        }
    })

    let request: { message: { message_id: string } } = await $fetch("/api/chat", { method: "post", body: { message_id: null } })
    let initialNodeId = request.message.message_id

    nodes.find((node) => node.id == initialNodeId)!.data.isRoot = true

    return { nodes, edges }
}


// convert to db records and upload
async function flowToDb() {
    await $fetch("/api/dump", {
        method: "POST", body: {
            messages: dbNodes.value,
            message_responses: dbEdges.value,
        }
    });
}

// positions nodes to minimize edge-chaos
function topologicalSort() {

    const nodes = getNodes
    const edges = getEdges

    // Step 1: Calculate in-degrees of all nodes
    const inDegree: Record<string, number> = {};
    const adjacencyList: Record<string, string[]> = {};

    for (const node of nodes.value) {
        inDegree[node.id] = 0;
        adjacencyList[node.id] = [];
    }

    for (const edge of edges.value) {
        const { source, target } = edge;
        inDegree[target]++;
        adjacencyList[source].push(target);
    }

    // Step 2: Collect all nodes with in-degree 0
    const queue = [];
    for (const nodeId in inDegree) {
        if (inDegree[nodeId] === 0) {
            queue.push(nodeId);
        }
    }

    // Step 3: Perform topological sort
    const sorted = [];
    while (queue.length > 0) {
        const node = queue.shift();
        sorted.push(node);

        for (const neighbor of adjacencyList[node!]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }

    // If sorted.length !== nodes.length, there's a cycle
    if (sorted.length !== nodes.value.length) {
        throw new Error("Graph contains a cycle and cannot be topologically sorted.");
    }

    // Step 4: Arrange nodes in columns of width 400
    const columnWidth = 400;
    const columnLevels: { [key: number]: number } = {}; // Tracks the current row for each column

    for (const nodeId of sorted) {
        // Find the column by looking at its dependencies
        let column = 0;
        for (const edge of edges.value) {
            if (edge.target === nodeId) {
                column = Math.max(column, nodes.value.find((n) => n.id === edge.source)!.data.column + 1 || 0);
            }
        }

        // Determine the row for this column
        if (!columnLevels[column]) {
            columnLevels[column] = 0;
        }

        const row = columnLevels[column];
        const node = nodes.value.find((n) => n.id === nodeId);
        if (node) {
            node.position = { x: column * columnWidth + 100, y: row * columnWidth + 100 + (column % 2 ? 0 : 200) };
            node.data.column = column; // Store column data for reference
        }
        columnLevels[column]++;

        for (let node of nodes.value) {
            updateNode(node.id, node)
        }

    }
}


// setup flow
const { onConnect, addEdges, addNodes, getConnectedEdges, updateNode, getViewport, getEdges, getNodes } = useVueFlow();
let flow = await flowFromDb()
let nodes = ref(flow.nodes)
let edges = ref(flow.edges)
setTimeout(topologicalSort, 0)

onConnect((edge: any) => {
    edge.type = "dialog"
    edge.data = { label: "" }
    addEdges(edge)
});

// helpers to convert flow to db records
let dbNodes = computed(() => {
    return getNodes.value.map((node) => {
        return {
            message_id: node.id,
            message_text: node.data.label,
        }
    })
})

let dbEdges = computed(() => {
    return getEdges.value.map((edge) => {
        return {
            message_id: edge.source,
            response_id: edge.target,
            response_text: edge.data.label,
        }
    })
})

// types of flow elements
const nodeTypes = {
    dialog: markRaw(DialogNode),
}
const edgeTypes = {
    dialog: markRaw(DialogEdge),
}

// helper to spawn a new node
function newNode() {
    const viewport = getViewport()
    return {
        id: v4(),
        position: { x: (200 - viewport.x) / viewport.zoom, y: (200 - viewport.y) / viewport.zoom },
        data: { label: "" },
        type: "dialog"
    }
}

</script>
