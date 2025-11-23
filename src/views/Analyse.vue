<template>
  <div
    class="min-h-screen w-full bg-gray-900 text-gray-200 p-4 flex flex-col items-center"
    :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }"
  >
    <!-- ZOOM -->
    <div class="flex gap-2 mb-4 items-center">
      <label class="text-gray-400 text-sm">Zoom :</label>
      <button @click="zoomOut" class="px-2 py-1 bg-gray-700 rounded text-sm">-</button>
      <button @click="zoomIn" class="px-2 py-1 bg-gray-700 rounded text-sm">+</button>
      <span class="ml-2 text-gray-300 text-sm">{{ (zoom * 100).toFixed(0) }}%</span>
    </div>

    <div class="w-full max-w-6xl">
      <!-- TITRE -->
      <h1 class="text-2xl md:text-3xl font-extrabold text-center mb-6 text-blue-300">
        Analyse financière complète
      </h1>

      <!-- 🔵 Résumé global (cartes compactes) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div class="bg-gray-800 shadow-md rounded-lg p-4 flex flex-col gap-1">
          <p class="text-gray-400 text-sm">Revenus mensuels:</p>
          <p class="text-xl md:text-2xl font-bold text-green-400">
            {{ revenusTotal.toFixed(2) }} $
          </p>
        </div>
        <div class="bg-gray-800 shadow-md rounded-lg p-4 flex flex-col gap-1">
          <p class="text-gray-400 text-sm">Dépenses mensuelles:</p>
          <p class="text-xl md:text-2xl font-bold text-red-400">{{ depensesTotal.toFixed(2) }} $</p>
        </div>
        <div class="bg-gray-800 shadow-md rounded-lg p-4 flex flex-col gap-1">
          <p class="text-gray-400 text-sm">Solde mensuel:</p>
          <p
            :class="soldeMensuel >= 0 ? 'text-green-300' : 'text-red-300'"
            class="text-xl md:text-2xl font-bold"
          >
            {{ soldeMensuel.toFixed(2) }} $
          </p>
        </div>
      </div>

      <!-- 🔵 Graphiques (grille compacte) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <!-- Répartition -->
        <div class="bg-gray-800 p-3 rounded-lg shadow-md">
          <h2 class="text-lg font-bold mb-2">Répartition des dépenses</h2>
          <canvas ref="pieChart" class="max-h-48"></canvas>
        </div>

        <!-- Revenus vs Dépenses -->
        <div class="bg-gray-800 p-3 rounded-lg shadow-md">
          <h2 class="text-lg font-bold mb-2">Revenus vs Dépenses</h2>
          <canvas ref="barChart" class="max-h-48"></canvas>
        </div>

        <!-- Évolution -->
        <div class="bg-gray-800 p-3 rounded-lg shadow-md lg:col-span-2">
          <h2 class="text-lg font-bold mb-2">Évolution des dépenses (12 derniers mois)</h2>
          <canvas ref="lineChart" class="max-h-56"></canvas>
        </div>
      </div>

      <!-- 🔵 Statistiques avancées -->
      <div class="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-bold mb-3 text-blue-300">Statistiques avancées</h2>
        <ul class="space-y-1 text-sm md:text-base">
          <li><strong>Taux d’épargne :</strong> {{ tauxEpargne.toFixed(1) }}%</li>
          <li>
            <strong>Dépense moyenne par catégorie :</strong> {{ depenseMoyenne.toFixed(2) }} $
          </li>
          <li>
            <strong>Catégorie la plus coûteuse :</strong> {{ categorieMax }} ({{
              maxMontant.toFixed(2)
            }}
            $)
          </li>
          <li>
            <strong>Catégorie la moins coûteuse :</strong> {{ categorieMin }} ({{
              minMontant.toFixed(2)
            }}
            $)
          </li>
          <li>
            <strong>Dépenses récurrentes mensuelles :</strong> {{ totalRecurrent.toFixed(2) }} $
          </li>
        </ul>
      </div>

      <!-- 🔵 Recommandations intelligentes -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-md">
        <h2 class="text-lg font-bold mb-3 text-blue-300">Recommandations intelligentes</h2>
        <ul class="space-y-2 text-sm md:text-base">
          <li v-for="(rec, i) in recommandations" :key="i" class="flex items-start">
            <span class="text-blue-400 mr-2">✔</span> {{ rec }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Chart } from 'chart.js/auto'

const depenses = ref([])
const revenus = ref([])

const zoom = ref(1)
function zoomIn() {
  zoom.value = Math.min(1.5, zoom.value + 0.1)
}
function zoomOut() {
  zoom.value = Math.max(0.6, zoom.value - 0.1)
}

onMounted(() => {
  const d = localStorage.getItem('depenses')
  const r = localStorage.getItem('revenus')

  if (d) depenses.value = JSON.parse(d)
  if (r) revenus.value = JSON.parse(r)

  renderCharts()
})

// Fonction pour transformer toutes les dépenses/ revenus en équivalent mensuel
function montantMensuel(item) {
  switch (item.type) {
    case 'Ponctuel':
      if (!item.date) return 0
      const dateItem = new Date(item.date)
      const today = new Date()
      return dateItem.getFullYear() === today.getFullYear() &&
        dateItem.getMonth() === today.getMonth()
        ? item.montant
        : 0
    case 'Hebdomadaire':
      return item.montant * 4.345
    case 'Mensuel':
      return item.montant
    case 'Annuel':
      return item.montant / 12
    default:
      return 0
  }
}

/* ---------- CALCULS ---------- */
const depensesTotal = computed(() => depenses.value.reduce((a, d) => a + montantMensuel(d), 0))
const revenusTotal = computed(() => revenus.value.reduce((a, r) => a + montantMensuel(r), 0))
const soldeMensuel = computed(() => revenusTotal.value - depensesTotal.value)

const categoriesStats = computed(() => {
  const map = {}
  depenses.value.forEach((d) => {
    if (!map[d.categorie]) map[d.categorie] = 0
    map[d.categorie] += montantMensuel(d)
  })
  return map
})

const depenseMoyenne = computed(() => depensesTotal.value / Math.max(depenses.value.length, 1))
const categorieMax = computed(
  () =>
    Object.keys(categoriesStats.value).sort(
      (a, b) => categoriesStats.value[b] - categoriesStats.value[a],
    )[0] || 'N/A',
)
const categorieMin = computed(
  () =>
    Object.keys(categoriesStats.value).sort(
      (a, b) => categoriesStats.value[a] - categoriesStats.value[b],
    )[0] || 'N/A',
)
const maxMontant = computed(() => categoriesStats.value[categorieMax.value] || 0)
const minMontant = computed(() => categoriesStats.value[categorieMin.value] || 0)
const tauxEpargne = computed(() =>
  revenusTotal.value === 0 ? 0 : (soldeMensuel.value / revenusTotal.value) * 100,
)
const totalRecurrent = computed(() =>
  depenses.value.filter((d) => d.type === 'Mensuel').reduce((a, d) => a + d.montant, 0),
)

const recommandations = computed(() => {
  const r = []
  if (tauxEpargne.value < 10)
    r.push('Votre taux d’épargne est faible. Essayez de viser au moins 20%.')
  if (maxMontant.value > depensesTotal.value * 0.35)
    r.push(`Votre catégorie "${categorieMax.value}" représente une dépense disproportionnée.`)
  if (soldeMensuel.value < 0)
    r.push('Votre solde est négatif. Réduisez vos dépenses ou augmentez vos revenus.')
  if (totalRecurrent.value > revenusTotal.value * 0.5)
    r.push('Attention : vos dépenses récurrentes représentent plus de 50% de vos revenus.')
  if (r.length === 0) r.push('Vos finances sont saines ! Continuez comme ça 👍')
  return r
})

/* ---------- GRAPHIQUES ---------- */
const pieChart = ref(null)
const barChart = ref(null)
const lineChart = ref(null)

function renderCharts() {
  const labels = Object.keys(categoriesStats.value)
  const values = Object.values(categoriesStats.value)

  new Chart(pieChart.value, { type: 'doughnut', data: { labels, datasets: [{ data: values }] } })
  new Chart(barChart.value, {
    type: 'bar',
    data: {
      labels: ['Revenus', 'Dépenses'],
      datasets: [{ data: [revenusTotal.value, depensesTotal.value] }],
    },
  })

  // Évolution des 12 derniers mois
  const today = new Date()
  const last12Months = Array.from(
    { length: 12 },
    (_, i) => new Date(today.getFullYear(), today.getMonth() - (11 - i), 1),
  )

  const monthlyDepenses = last12Months.map((month) =>
    depenses.value.reduce((total, d) => {
      switch (d.type) {
        case 'Ponctuel':
          if (!d.date) return total
          const depDate = new Date(d.date)
          if (
            depDate.getFullYear() === month.getFullYear() &&
            depDate.getMonth() === month.getMonth()
          )
            return total + d.montant
          return total
        case 'Hebdomadaire':
          return total + d.montant * 4.345
        case 'Mensuel':
          return total + d.montant
        case 'Annuel':
          return total + d.montant / 12
        default:
          return total
      }
    }, 0),
  )

  const monthlyRevenus = last12Months.map((month) =>
    revenus.value.reduce((total, r) => {
      switch (r.type) {
        case 'Ponctuel':
          if (!r.date) return total
          const revDate = new Date(r.date)
          if (
            revDate.getFullYear() === month.getFullYear() &&
            revDate.getMonth() === month.getMonth()
          )
            return total + r.montant
          return total
        case 'Hebdomadaire':
          return total + r.montant * 4.345
        case 'Mensuel':
          return total + r.montant
        case 'Annuel':
          return total + r.montant / 12
        default:
          return total
      }
    }, 0),
  )

  new Chart(lineChart.value, {
    type: 'line',
    data: {
      labels: last12Months.map((m) => m.toLocaleString('fr-FR', { month: 'short' })),
      datasets: [
        {
          label: 'Dépenses',
          data: monthlyDepenses,
          borderColor: 'rgb(255,99,132)',
          backgroundColor: 'rgba(255,99,132,0.2)',
          tension: 0.4,
        },
        {
          label: 'Revenus',
          data: monthlyRevenus,
          borderColor: 'rgb(75,192,192)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          tension: 0.4,
        },
      ],
    },
    options: { scales: { y: { beginAtZero: true } } },
  })
}
</script>
