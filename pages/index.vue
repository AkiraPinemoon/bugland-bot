<template>
  <div>
    <h1>Bugland Chat</h1>
      <div class="p-2">
        <div v-for="message in messages" :key="message" class="flex flex-col gap-2 mb-4">
          <Transition name="message" tag="div">
            <div v-if="message.message.show" class="relative p-2 bg-gray-200 rounded-b-xl rounded-r-xl max-w-lg">
              {{ message.message.message_text }}
              <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-gray-200" :style="arrowMessage"></div>
            </div>
          </Transition>
          <TransitionGroup name="item" tag="button" class="self-end flex flex-col gap-2">
            <button v-for="response in message.responses_select" :key="response" :disabled="message.message.message_id != current" @click="chat(response.response_id); message.responses_select = [response]; response.selected = true" class="self-end">
              <div class="relative ounded-b-xl rounded-l-xl p-2 max-w-lg"
                   :class="(message.message.message_id == current && !response.selected) ? 'bg-green-300' : 'bg-blue-300'">
                {{ response.response_text }}
                <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent"
                     :class="(message.message.message_id == current && !response.selected) ? 'border-t-green-300' : 'border-t-blue-300'"
                     :style="arrowResponse"></div>
              </div>
            </button>
          </TransitionGroup>
        </div>
      <div v-if="showWait">
        ...
      </div>
      <!--
      <div class="relative text-nowrap bg-bg border border-highlight text-white text-sm rounded py-1 px-2 shadow-lg z-50 transition-opacity duration-200 pointer-events-none"> 
        Hallo
        --><!-- Pfeil --><!--
        <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent" :style="arrowStyle"></div>
      </div>-->
    </div>

  </div>
</template>

<script lang="ts" setup>
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

const showWait = ref(false)
const messages = ref([])
const current = computed(() => {
  return messages.value.at(-1).message.message_id
})

async function chat(id: string | null) {
  showWait.value = true

  let res = await useFetch("/api/chat", { method: "post", body: { message_id: id } })
  messages.value.push(res.data.value)


  await new Promise(resolve => setTimeout(resolve, 1000))
  showWait.value = false
  res.data.value.message.show = true
  res.data.value.responses_select = []
  await new Promise(resolve => setTimeout(resolve, 500))
  
  for (const response of res.data.value?.responses) {
    await new Promise(resolve => setTimeout(resolve, 100))
    res.data.value.responses_select.push(response)
  }
}

chat(null)

</script>

<style>
.message-enter-active {
  transition: all 0.75s;
}
.message-enter-from {
  opacity: 0;
  transform: translate(-100px)
}

.item-enter-active {
  transition: all 0.5s;
}
.item-enter-from {
  opacity: 0;
  transform: translate(10px)
}
</style>

<!-- JSON
{
  "message":
  {
    "message_id": "",
    "message_text": ""
  },
  "response":
  [{
    "response_id": "",
    "response_text": ""
  }]
}
-->
