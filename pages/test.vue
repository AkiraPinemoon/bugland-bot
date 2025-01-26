<template>
  <div>
    <h1>Bugland Testpage</h1>

    <section>
      <h2>/api/chat</h2>
      <input v-model="message_id"></input>
      <button @click="chat">Send request</button>
      <p>{{ response }}</p>
    </section>
  </div>
</template>

<script lang="ts" setup>

const message_id = ref("")
const response = ref("send the request to see a result")

async function chat() {
  let res = await useFetch("/api/chat", { method: "post", body: { message_id: message_id.value } })
  response.value = res.data.value
}

</script>
