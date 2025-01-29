<template>
    <div class="w-full flex flex-col place-items-center p-4 gap-2 grow">
        <div
            class="p-4 relative max-w-xl overflow-clip w-full rounded border border-gray-200 min-h-96 grow max-h-full overflow-y-scroll flex flex-col gap-2">
            <h1>View a Conversation</h1>
            <div class="flex w-full gap-2">
                <input v-model="conversationId" class="grow rounded p-2" placeholder="Conversation-ID" />
                <button @click="loadConversation" class="cursor-pointer bg-green-600 p-2 rounded">Load</button>
            </div>

            <hr />

            <div v-for="interaction in interactions" class="flex flex-col gap-2">

                <div v-if="interaction.response != 'undefined'" class="self-end">
                    <div class="relative rounded-b-xl rounded-l-xl p-2 max-w-lg bg-blue-300 dark:bg-blue-300">
                        {{ interaction.response }}
                        <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-blue-300 ddark:border-t-blue-300"
                            :style="arrowResponse"></div>
                    </div>
                </div>

                <div class="relative p-2 bg-gray-200 dark:bg-gray-200 rounded-b-xl rounded-r-xl max-w-lg">
                    {{ interaction.message }}
                    <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-gray-200 dark:border-t-gray-200"
                        :style="arrowMessage"></div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const arrowMessage = {
    top: "0",
    right: "100%",
    transform: "translate(0,0) rotateZ(90deg)"
};
const arrowResponse = {
    top: "0",
    left: "100%",
    transform: "translate(0,0) rotateZ(270deg)"
};

const conversationId = ref("")
const interactions = ref<{
    interaction_id: string,
    conversation_id: string,
    timestamp: string,
    message: string,
    response: string,
}[]>([])

async function loadConversation() {
    interactions.value = await $fetch("/api/conversation", {
        method: "POST",
        body: {
            conversationId: conversationId.value,
        }
    })
}

// example conversation_id cd3ed53c-7dfb-425e-8b27-924dfa4b4f4d

</script>
