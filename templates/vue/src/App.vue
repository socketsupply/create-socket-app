<script setup>
import HelloWorld from './components/HelloWorld.vue'
import os from 'socket:os'
const toProperCase = s => s[0].toUpperCase() + s.slice(1)
</script>

<template>
  <HelloWorld :msg="`Vite + Vue (on ${toProperCase(os.platform())})`" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
