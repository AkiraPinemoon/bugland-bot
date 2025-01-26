<template>
    <div class="w-full h-screen">
        <VueFlow :nodes="nodes" :edges="edges" class="w-full h-full" :nodeTypes="nodeTypes">
            <MiniMap />

            <div class="absolute top-2 left-2 p-2 flex flex-col gap-2">
                <button @click="addNodes(newNode)"
                    class="p-2 rounded z-10 bg-gray-800 bg-opacity-50 backdrop-blur-sm">Add Node</button>
                <button @click="topologicalSort()"
                    class="p-2 rounded z-10 bg-gray-800 bg-opacity-50 backdrop-blur-sm">Auto Arrange</button>
            </div>
        </VueFlow>
    </div>
</template>

<script setup lang="ts">
import { Html } from '#components';
import { ConnectionMode, Position, useVueFlow, type Connection, type GraphEdge, type GraphNode } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { v4 } from 'uuid';
import DialogNode from '~/components/DialogNode.vue';

async function flowFromDb() {
    let data = await $fetch("/api/dump");
    const nodes = data.message.map((message) => {
        return {
            id: message.message_id,
            position: { x: 100, y: 100 },
            data: { label: message.message_text },
            type: "dialog",
        }
    })

    const edges = data.responses.map((response) => {
        return {
            id: response.message_id + response.response_id,
            source: response.message_id,
            target: response.response_id,
            label: response.response_text
        }
    })

    let request = await $fetch("/api/chat", { method: "post", body: { message_id: null } })
    let initialNodeId = request.message.message_id

    nodes.find((node) => node.id == initialNodeId).data.isRoot = true

    return { nodes, edges }
}

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

        for (const neighbor of adjacencyList[node]) {
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
    const columnLevels = {}; // Tracks the current row for each column

    for (const nodeId of sorted) {
        // Find the column by looking at its dependencies
        let column = 0;
        for (const edge of edges.value) {
            if (edge.target === nodeId) {
                column = Math.max(column, nodes.value.find((n) => n.id === edge.source).data.column + 1 || 0);
            }
        }

        // Determine the row for this column
        if (!columnLevels[column]) {
            columnLevels[column] = 0;
        }

        const row = columnLevels[column];
        const node = nodes.value.find((n) => n.id === nodeId);
        node.position = { x: column * columnWidth + 100, y: row * columnWidth + 100 };
        node.data.column = column; // Store column data for reference
        columnLevels[column]++;

        for (let node of nodes.value) {
            updateNode(node.id, node)
        }

    }
}

const { onConnect, addEdges, addNodes, getConnectedEdges, updateNode, getEdges, getNodes } = useVueFlow();

let flow = await flowFromDb()
let nodes = flow.nodes
let edges = flow.edges

setTimeout(topologicalSort, 0)



onConnect(addEdges);

const nodeTypes = {
    dialog: markRaw(DialogNode),
}


function newNode() {
    return {
        id: v4(),
        position: { x: 0, y: 0 },
        data: { label: "" },
        type: "dialog"
    }
}

function maxOneConnectionGuard(conn: Connection, elements: { edges: GraphEdge[], nodes: GraphNode[], sourceNode: GraphNode, tagetNode: GraphNode }) {
    let outgoingEdges = getConnectedEdges(elements.sourceNode.id).filter((edge) => edge.source == elements.sourceNode.id)
    return outgoingEdges.length == 0
}

</script>
