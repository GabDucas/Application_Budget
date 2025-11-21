<template>
  <nav class="w-full bg-gray-850 text-gray-200 shadow-lg border-b border-gray-700">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <!-- Logo -->
      <router-link to="/" class="text-2xl font-bold text-blue-400 hover:text-blue-300 transition">
        MonBudget+
      </router-link>

      <!-- Navigation -->
      <div class="flex items-center gap-6 text-lg">
        <router-link
          to="/"
          class="hover:text-blue-300 transition"
          :class="{ 'text-blue-400 font-semibold': $route.path === '/' }"
        >
          Dépenses
        </router-link>

        <router-link
          to="/analyse"
          class="hover:text-blue-300 transition"
          :class="{ 'text-blue-400 font-semibold': $route.path === '/analyse' }"
        >
          Analyse
        </router-link>

        <button
          @click="exporterJSON"
          class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          Export JSON
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
function exporterJSON() {
  const data = {
    depenses: JSON.parse(localStorage.getItem('depenses') || '[]'),
    revenus: JSON.parse(localStorage.getItem('revenus') || '[]'),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = 'finances.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.bg-gray-850 {
  background-color: #141417;
}
</style>
