<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center p-6 text-gray-100">
    <div class="w-full max-w-4xl bg-gray-800 shadow-2xl rounded-2xl p-8">
      <h1 class="text-4xl font-extrabold text-center text-white mb-6">Affichage des dépenses</h1>

      <!-- Tableau -->
      <div class="overflow-x-auto rounded-lg">
        <table class="w-full border-collapse">
          <thead class="bg-gray-700 text-gray-200 uppercase text-sm">
            <tr>
              <th class="py-3 px-4 text-left">Catégorie</th>
              <th class="py-3 px-4 text-left">Montant ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(depense, index) in depenses"
              :key="index"
              class="border-b border-gray-600 hover:bg-gray-700 transition"
            >
              <td class="py-2 px-4">{{ depense.categorie }}</td>
              <td class="py-2 px-4 font-medium">{{ depense.montant.toFixed(2) }}</td>
            </tr>
            <tr class="font-bold text-right text-gray-200">
              <td class="py-2 px-4">Total</td>
              <td class="py-2 px-4">{{ total.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Résumé par catégorie -->
      <div class="mt-6">
        <h2 class="text-2xl font-bold mb-4 text-gray-200">Résumé par catégorie</h2>
        <ul class="space-y-2">
          <li v-for="(montant, categorie) in totalParCategorie" :key="categorie"
              class="flex justify-between px-4 py-2 bg-gray-700 rounded-lg">
            <span>{{ categorie }}</span>
            <span>{{ montant.toFixed(2) }} $</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const depenses = ref([])

onMounted(() => {
  const data = localStorage.getItem('depenses')
  if (data) depenses.value = JSON.parse(data)
})

const total = computed(() => depenses.value.reduce((acc, d) => acc + d.montant, 0))

const totalParCategorie = computed(() => {
  return depenses.value.reduce((acc, d) => {
    if (!acc[d.categorie]) acc[d.categorie] = 0
    acc[d.categorie] += d.montant
    return acc
  }, {})
})
</script>
