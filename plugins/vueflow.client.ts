import { defineNuxtPlugin } from "#app";
import { VueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

export default defineNuxtPlugin((nuxtApp) => {
  // Optionally register VueFlow as a global component
  nuxtApp.vueApp.component("VueFlow", VueFlow);
});
