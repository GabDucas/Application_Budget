<script setup>
import '../src/assets/main.css'
import { RouterView } from 'vue-router'
import TopBar from './components/TopBar.vue';
</script>

<template>
  <TopBar />
  <router-view />
</template>

<style>
/* Tu peux ajouter du style global si nécessaire */
</style>
