<script setup lang="ts">
import { NuxtLink } from '#components';

</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <header class="w-full h-20 px-6 py-2 border border-gray-200 flex gap-4 place-items-center bg-gray-100">
      <img src="/assets/logo.png" class="h-full" />
      <h1 class="text-5xl text-blue-200"><b>BUG</b>LAND</h1>
      <div class="grow"></div>
      <NuxtLink to="/">Support</NuxtLink>
      <NuxtLink to="/edit">Admin Panel</NuxtLink>
      <NuxtLink to="/log">Logs</NuxtLink>
    </header>
    <NuxtPage />
  </div>
</template>
