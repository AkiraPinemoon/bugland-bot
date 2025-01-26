<template>
  <div>
    <h1>Bugland Chat</h1>

    <div class="max-w-lg flex flex-col gap-2 p-2">
      <div v-for="message in messages" class="flex flex-col gap-2 p-2 bg-gray-200 rounded-xl">
        {{ message.message.message_text }}

        <button v-if="message.message.message_id == current" v-for="response in message.responses" @click="chat(response.response_id)" class="bg-green-300 rounded-xl p-1">
          {{ response.response_text }}
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>

const messages = ref([])
const current = computed(() => {
  return messages.value.at(-1).message.message_id
})

async function chat(id: string | null) {
  let res = await useFetch("/api/chat", { method: "post", body: { message_id: id } })
  messages.value.push(res.data.value)
}

chat(null)

</script>
