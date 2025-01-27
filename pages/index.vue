<template>
  <div>
    <h1>Bugland Chat</h1>
      <div class="p-2">
        <div v-for="message in messages" :key="message" class="flex flex-col gap-2 mb-4">
          <Transition name="message" tag="div">
            <div v-if="message.message.show" class="px-4 py-2 bg-gray-200 rounded-xl max-w-lg">
              {{ message.message.message_text }}
            </div>
          </Transition>
          <TransitionGroup name="item" tag="button" class="self-end flex flex-col gap-2">
            <button v-for="response in message.responses_select" :key="response" :disabled="message.message.message_id != current" @click="chat(response.response_id); message.responses_select = [response]; response.selected = true" class="self-end">
              <div v-if="message.message.message_id == current && !response.selected" class="bg-green-300 rounded-xl p-2 max-w-lg">
                {{ response.response_text }}
              </div>
              <div v-else class="bg-blue-300 rounded-xl p-2 pl-4 pr-4 max-w-lg">
                {{ response.response_text }}
              </div>
            </button>
          </TransitionGroup>
        </div>
      <div v-if="showWait">
        ...
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>


const showButton = ref(true)
const showWait = ref(false)
const messages = ref([])
const current = computed(() => {
  return messages.value.at(-1).message.message_id
})

async function chat(id: string | null) {
  showButton.value = false
  showWait.value = true

  let res = await useFetch("/api/chat", { method: "post", body: { message_id: id } })
  messages.value.push(res.data.value)


  await new Promise(resolve => setTimeout(resolve, 1000))
  showWait.value = false
  res.data.value.message.show = true
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  res.data.value.responses_select = res.data.value.responses
  showButton.value = true
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
