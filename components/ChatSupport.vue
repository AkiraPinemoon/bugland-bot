<template>
    <div class="p-4 relative max-w-xl overflow-clip w-full rounded border border-gray-200 min-h-96 grow max-h-full overflow-y-scroll flex flex-col gap-2">
        <h1>Bugland Chat-Support</h1>
        <hr />
        <div v-for="message in messages" :key="message as any" class="flex flex-col gap-2">
            <Transition name="message" tag="div">
                <div v-if="message.message.show"
                    class="relative p-2 bg-gray-200 dark:bg-gray-200 rounded-b-xl rounded-r-xl max-w-lg">
                    {{ message.message.message_text }}
                    <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-gray-200 dark:border-t-gray-200"
                        :style="arrowMessage"></div>
                </div>
            </Transition>
            <TransitionGroup name="item" tag="button" class="self-end flex flex-col gap-2">
                <button v-for="response in message.responses_select" :key="response.response_id"
                    :disabled="message.message.message_id != current"
                    @click="message.responses_select = [response]; response.selected = true; chat(response.response_id, 1)"
                    class="self-end">
                    <div class="relative rounded-b-xl rounded-l-xl p-2 max-w-lg"
                        :class="(message.message.message_id == current && !response.selected) ? 'bg-green-300 dark:bg-green-300' : 'bg-blue-300 dark:bg-blue-300'">
                        {{ response.response_text }}
                        <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent"
                            :class="(message.message.message_id == current && !response.selected) ? 'border-t-green-300 dark:border-t-green-300' : 'border-t-blue-300 ddark:border-t-blue-300'"
                            :style="arrowResponse"></div>
                    </div>
                </button>
            </TransitionGroup>
        </div>
        <div v-if="showWait">
            ...
        </div>
        <div ref="scrollDiv"></div>
        <div class="absolute bottom-0 right-0 p-2 opacity-50">{{ converationId }}</div>
    </div>
</template>

<script lang="ts" setup>
import { v4 } from 'uuid';

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

const converationId = ref(v4())

const scrollDiv = ref<HTMLElement | null>(null)
const showWait = ref(false)
const messages = ref<{
    message: {
        message_id: string,
        message_text: string,
        show: boolean,
    },
    responses: {
        message_id: string,
        response_id: string,
        response_text: string,
    }[],
    responses_select: {
        message_id: string,
        response_id: string,
        response_text: string,
        selected: boolean,
    }[],
}[]>([])
const current = computed(() => {
    return messages.value.at(-1)?.message.message_id
})

async function chat(id: string | null, delayMult: number) {
    showWait.value = true

    let res: any = await $fetch("/api/chat", { method: "POST", body: { messageId: id, conversationId: converationId.value, response: messages.value.at(-1)?.responses_select[0].response_text } })
    messages.value.push(res)
    scrollTo(scrollDiv)
    await new Promise(resolve => setTimeout(resolve, 1000 * delayMult))

    showWait.value = false
    messages.value.at(-1)!.message.show = true
    messages.value.at(-1)!.responses_select = []
    await new Promise(resolve => setTimeout(resolve, 400 * delayMult))
    scrollTo(scrollDiv)

    for (const response of res.responses) {
        await new Promise(resolve => setTimeout(resolve, 100 * delayMult))
        messages.value.at(-1)!.responses_select.push(response)
    }
    await new Promise(resolve => setTimeout(resolve, 200 * delayMult))
    scrollTo(scrollDiv)
}

function scrollTo(view: Ref<HTMLElement | null>) {
    view.value?.scrollIntoView({ behavior: "smooth" })
}

chat(null, 0)

</script>

<style>
.message-enter-active {
    transition: all 0.75s;
}

.message-enter-from {
    opacity: 0;
    transform: translate(-100px)
}

.item-move {
    transition: transform 0.5s;
}

.item-enter-active,
.item-leave-active {
    transition: all 0.5s;
}

.item-enter-from,
.item-leave-to {
    opacity: 0;
    transform: translate(10px)
}
</style>
