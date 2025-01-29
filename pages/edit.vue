<template>
    <div class="w-full h-screen flex">
        <ClientOnly>
            <div class="h-full flex flex-col p-2 gap-2 bg-gray-100 w-1/4 max-w-96">
                <button @click="flowToDb()" class="p-2 rounded bg-green-600">Export</button>
                <button @click="save()" class="p-2 rounded bg-green-600">Save</button>

                <button @click="addNewNode(newNode())" class="p-2 rounded bg-gray-300">Add
                    Node</button>
                <button @click="addNewNode(newGroupNode())" class="p-2 rounded bg-gray-300">Add
                    Group Node</button>
                <button @click="autoArrange()" class="p-2 rounded bg-gray-300">Auto
                    Arrange</button>

                <hr />
                <GroupEditor />
            </div>
            <VueFlow :nodes="useSelectedGroup()?.flow.nodes" :edges="useSelectedGroup()?.flow.edges" class="grow"
                :nodeTypes="nodeTypes" :edgeTypes="edgeTypes">
                <MiniMap pannable />
            </VueFlow>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useVueFlow, type EdgeChange, type GraphEdge, type GraphNode, type NodeChange } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { v4 } from 'uuid';
import DialogEdge from '~/components/DialogEdge.vue';
import DialogGroupNode from '~/components/DialogGroupNode.vue';
import DialogNode from '~/components/DialogNode.vue';
import GroupEditor from '~/components/GroupEditor.vue';
import type { Group } from '~/types';

// convert to db records and upload
async function flowToDb() {
    await $fetch("/api/dump", {
        method: "POST", body: {
            messages: dbNodes.value,
            message_responses: dbEdges.value,
        }
    });
}

// saves flow to db
async function save() {
    if (!groups.value) return
    const group = useSelectedGroup()
    if (group) {
        group.flow.nodes = getNodes.value
        group.flow.edges = getEdges.value
    }

    await $fetch("/api/flow", {
        method: "POST", body: {
            flow: groups.value
        }
    });
}

// positions nodes to minimize edge-chaos
function topologicalSort() {
    const nodes = getNodes;
    const edges = getEdges;

    // Step 1: Calculate in-degrees and adjacency list
    const inDegree: Record<string, number> = {};
    const adjacencyList: Record<string, string[]> = {};
    const reverseAdjacencyList: Record<string, string[]> = {};

    for (const node of nodes.value) {
        inDegree[node.id] = 0;
        adjacencyList[node.id] = [];
        reverseAdjacencyList[node.id] = [];
    }

    for (const edge of edges.value) {
        const { source, target } = edge;
        inDegree[target]++;
        adjacencyList[source].push(target);
        reverseAdjacencyList[target].push(source);
    }

    // Step 2: Detect strongly connected components (SCCs) to handle cycles
    let index = 0;
    const stack: string[] = [];
    const onStack: Record<string, boolean> = {};
    const indexes: Record<string, number> = {};
    const lowLinks: Record<string, number> = {};
    const sccs: string[][] = [];

    function tarjan(nodeId: string) {
        indexes[nodeId] = index;
        lowLinks[nodeId] = index;
        index++;
        stack.push(nodeId);
        onStack[nodeId] = true;

        for (const neighbor of adjacencyList[nodeId]) {
            if (indexes[neighbor] === undefined) {
                tarjan(neighbor);
                lowLinks[nodeId] = Math.min(lowLinks[nodeId], lowLinks[neighbor]);
            } else if (onStack[neighbor]) {
                lowLinks[nodeId] = Math.min(lowLinks[nodeId], indexes[neighbor]);
            }
        }

        // If nodeId is the root of an SCC
        if (lowLinks[nodeId] === indexes[nodeId]) {
            const scc: string[] = [];
            let w;
            do {
                w = stack.pop()!;
                onStack[w] = false;
                scc.push(w);
            } while (w !== nodeId);
            sccs.push(scc);
        }
    }

    for (const node of nodes.value) {
        if (indexes[node.id] === undefined) {
            tarjan(node.id);
        }
    }

    // Step 3: Create a DAG of SCCs
    const sccInDegree: Record<number, number> = {};
    const sccAdjacencyList: Record<number, number[]> = {};
    const sccMap: Record<string, number> = {}; // Map nodeId to SCC index

    sccs.forEach((scc, sccIndex) => {
        sccInDegree[sccIndex] = 0;
        sccAdjacencyList[sccIndex] = [];
        for (const nodeId of scc) {
            sccMap[nodeId] = sccIndex;
        }
    });

    for (const edge of edges.value) {
        const sourceScc = sccMap[edge.source];
        const targetScc = sccMap[edge.target];
        if (sourceScc !== targetScc) {
            sccAdjacencyList[sourceScc].push(targetScc);
            sccInDegree[targetScc]++;
        }
    }

    // Step 4: Topologically sort SCCs
    const sccQueue: number[] = [];
    for (const sccIndex in sccInDegree) {
        if (sccInDegree[sccIndex] === 0) {
            sccQueue.push(parseInt(sccIndex));
        }
    }

    const sortedSccs: number[] = [];
    while (sccQueue.length > 0) {
        const sccIndex = sccQueue.shift()!;
        sortedSccs.push(sccIndex);

        for (const neighbor of sccAdjacencyList[sccIndex]) {
            sccInDegree[neighbor]--;
            if (sccInDegree[neighbor] === 0) {
                sccQueue.push(neighbor);
            }
        }
    }

    // Step 5: Arrange nodes in columns, considering SCCs
    const columnWidth = 400;
    const columnLevels: Record<number, number> = {}; // Tracks the current row for each column

    for (const sccIndex of sortedSccs) {
        for (const nodeId of sccs[sccIndex]) {
            // Determine column based on dependencies
            let column = 0;
            for (const edge of edges.value) {
                if (edge.target === nodeId) {
                    const sourceNode = nodes.value.find((n) => n.id === edge.source);
                    column = Math.max(column, sourceNode?.data.column + 1 || 0);
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
        }
    }

    // Step 6: Update nodes
    for (const node of nodes.value) {
        updateNode(node.id, node);
    }
}

function autoArrange() {
    topologicalSort()
    fitView({ duration: 300 })
}

const selectedGroupId = useSelectedGroupId()
const groups = useGroups()

// load flow from db
groups.value = await $fetch("/api/flow");
selectedGroupId.value = groups.value?.mainGroupId!

// setup flow
const { onConnect, addEdges, addNodes, updateNode, getViewport, fitView, addSelectedNodes, onNodesChange, applyNodeChanges, onEdgesChange, applyEdgeChanges, getEdges, getNodes, applyDefault } = useVueFlow();

applyDefault.value = false

onEdgesChange(applyEdgeChanges)

onNodesChange((changes: NodeChange[]) => {
    // filter to disallow deletion of root nodes
    changes = changes.filter((change: NodeChange) => !(change.type == "remove" && getNodes.value.find((node) => node.id == change.id)?.data.isRoot))
    applyNodeChanges(changes)
})

onConnect((edge: any) => {
    edge.type = "dialog"
    edge.data = { label: "" }
    addEdges(edge)
});

setTimeout(() => fitView, 0)

// helpers to convert flow to db records
let dbNodes = computed(() => {
    const group = useSelectedGroup()
    if (group) group.flow.nodes = getNodes.value
    return groups.value?.groups.flatMap((group) => group.flow.nodes.filter((node) => node.type == "dialog").map((node) => {
        return {
            message_id: node.id,
            message_text: node.data.label,
        }
    }))
})

let dbEdges = computed(() => {
    const group = useSelectedGroup()
    if (group) group.flow.edges = getEdges.value
    return groups.value?.groups.flatMap((group) => group.flow.edges.map((edge) => {
        const target = group.flow.nodes.find((node) => node.id == edge.target)!
        if (target.type == "dialog") {
            return {
                message_id: edge.source,
                response_id: edge.target,
                response_text: edge.data.label,
            }
        } else {
            console.log("export")
            return {
                message_id: edge.source,
                response_id: groups.value?.groups.find((group) => group.id == target.data.group)!.root,
                response_text: edge.data.label,
            }
        }
    }))
})

// types of flow elements
const nodeTypes = {
    dialog: markRaw(DialogNode),
    dialogGroup: markRaw(DialogGroupNode),
}
const edgeTypes = {
    dialog: markRaw(DialogEdge),
}

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

// helper to spawn a new group node
function newGroupNode(): GraphNode {
    const viewport = getViewport()
    return {
        id: v4(),
        position: { x: (200 - viewport.x) / viewport.zoom, y: (200 - viewport.y) / viewport.zoom },
        data: { label: "" },
        type: "dialogGroup"
    } as GraphNode
}

// adds a new node
function addNewNode(node: GraphNode) {
    addNodes(node)
    addSelectedNodes([node as any])
}

</script>
