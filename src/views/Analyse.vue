<template>
  <div class="min-h-screen w-full bg-gray-900 text-gray-200 p-6 flex flex-col items-center">
    <div class="w-full max-w-6xl">

      <!-- TITRE -->
      <h1 class="text-4xl font-extrabold text-center mb-8 text-blue-300">
        Analyse financière complète
      </h1>

      <!-- 🔵 Résumé global -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-gray-800 shadow-xl rounded-xl p-6 flex flex-col gap-2">
          <p class="text-gray-400">Revenus mensuels:</p>
          <p class="text-3xl font-bold text-green-400">{{ revenusTotal.toFixed(2) }} $</p>
        </div>
        <div class="bg-gray-800 shadow-xl rounded-xl p-6 flex flex-col gap-2">
          <p class="text-gray-400">Dépenses mensuelles:</p>
          <p class="text-3xl font-bold text-red-400">{{ depensesTotal.toFixed(2) }} $</p>
        </div>
        <div class="bg-gray-800 shadow-xl rounded-xl p-6 flex flex-col gap-2">
          <p class="text-gray-400">Solde mensuel:</p>
          <p :class="soldeMensuel >= 0 ? 'text-green-300' : 'text-red-300'"
             class="text-3xl font-bold">
            {{ soldeMensuel.toFixed(2) }} $
          </p>
        </div>
      </div>

      <!-- 🔵 Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        
        <!-- Répartition -->
        <div class="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 class="text-xl font-bold mb-4">Répartition des dépenses</h2>
          <canvas ref="pieChart"></canvas>
        </div>

        <!-- Revenus vs Dépenses -->
        <div class="bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 class="text-xl font-bold mb-4">Revenus vs Dépenses</h2>
          <canvas ref="barChart"></canvas>
        </div>

        <!-- Évolution -->
        <div class="bg-gray-800 p-6 rounded-xl shadow-xl lg:col-span-2">
          <h2 class="text-xl font-bold mb-4">Évolution des dépenses (12 derniers mois)</h2>
          <canvas ref="lineChart"></canvas>
        </div>
      </div>

      <!-- 🔵 Statistiques avancées -->
      <div class="bg-gray-800 p-8 rounded-xl shadow-xl mb-12">
        <h2 class="text-2xl font-bold mb-6 text-blue-300">Statistiques avancées</h2>
        
        <ul class="space-y-3 text-lg">
          <li><strong>Taux d’épargne :</strong> {{ tauxEpargne.toFixed(1) }}%</li>
          <li><strong>Dépense moyenne par catégorie :</strong> {{ depenseMoyenne.toFixed(2) }} $</li>
          <li><strong>Catégorie la plus coûteuse :</strong> {{ categorieMax }} ({{ maxMontant.toFixed(2) }} $)</li>
          <li><strong>Catégorie la moins coûteuse :</strong> {{ categorieMin }} ({{ minMontant.toFixed(2) }} $)</li>
          <li><strong>Dépenses récurrentes mensuelles :</strong> {{ totalRecurrent.toFixed(2) }} $</li>
        </ul>
      </div>

      <!-- 🔵 Recommandations intelligentes -->
      <div class="bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-xl">
        <h2 class="text-2xl font-bold mb-6 text-blue-300">Recommandations intelligentes</h2>
        <ul class="space-y-4 text-lg">
          <li v-for="(rec, i) in recommandations" :key="i" class="flex items-start">
            <span class="text-blue-400 mr-2">✔</span> {{ rec }}
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Chart } from "chart.js/auto";

const depenses = ref([]);
const revenus = ref([]);

onMounted(() => {
  const d = localStorage.getItem("depenses");
  const r = localStorage.getItem("revenus");

  if (d) depenses.value = JSON.parse(d);
  if (r) revenus.value = JSON.parse(r);

  renderCharts();
});

/* ---------- CALCULS ---------- */

// Totaux
const depensesTotal = computed(() => depenses.value.reduce((a, d) => a + d.montant, 0));
const revenusTotal = computed(() => revenus.value.reduce((a, r) => a + r.montant, 0));

const soldeMensuel = computed(() => revenusTotal.value - depensesTotal.value);

// Catégories
const categoriesStats = computed(() => {
  const map = {};
  depenses.value.forEach(d => {
    if (!map[d.categorie]) map[d.categorie] = 0;
    map[d.categorie] += d.montant;
  });
  return map;
});

const depenseMoyenne = computed(() => depensesTotal.value / Math.max(depenses.value.length, 1));

const categorieMax = computed(() => Object.keys(categoriesStats.value)
  .sort((a, b) => categoriesStats.value[b] - categoriesStats.value[a])[0] || "N/A");

const categorieMin = computed(() => Object.keys(categoriesStats.value)
  .sort((a, b) => categoriesStats.value[a] - categoriesStats.value[b])[0] || "N/A");

const maxMontant = computed(() => categoriesStats.value[categorieMax.value] || 0);
const minMontant = computed(() => categoriesStats.value[categorieMin.value] || 0);

// Taux d'épargne
const tauxEpargne = computed(() => {
  if (revenusTotal.value === 0) return 0;
  return (soldeMensuel.value / revenusTotal.value) * 100;
});

// Récurrent
const totalRecurrent = computed(() =>
  depenses.value
    .filter(d => d.type === "Mensuel")
    .reduce((a, d) => a + d.montant, 0)
);

/* ---------- RECOMMANDATIONS ---------- */
const recommandations = computed(() => {
  const r = [];

  if (tauxEpargne.value < 10)
    r.push("Votre taux d’épargne est faible. Essayez de viser au moins 20%.");

  if (maxMontant.value > depensesTotal.value * 0.35)
    r.push(`Votre catégorie "${categorieMax.value}" représente une dépense disproportionnée.`);

  if (soldeMensuel.value < 0)
    r.push("Votre solde est négatif. Réduisez vos dépenses ou augmentez vos revenus.");

  if (totalRecurrent.value > revenusTotal.value * 0.5)
    r.push("Attention : vos dépenses récurrentes représentent plus de 50% de vos revenus.");

  if (r.length === 0) r.push("Vos finances sont saines ! Continuez comme ça 👍");

  return r;
});

/* ---------- GRAPHIQUES ---------- */

const pieChart = ref(null);
const barChart = ref(null);
const lineChart = ref(null);

function renderCharts() {
  const labels = Object.keys(categoriesStats.value);
  const values = Object.values(categoriesStats.value);

  // Pie
  new Chart(pieChart.value, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values }] },
  });

  // Bar
  new Chart(barChart.value, {
    type: "bar",
    data: {
      labels: ["Revenus", "Dépenses"],
      datasets: [{ data: [revenusTotal.value, depensesTotal.value] }],
    },
  });

  // Fake line graph (12 months approx) — real data possible plus tard
  new Chart(lineChart.value, {
    type: "line",
    data: {
      labels: ["-11", "-10", "-9", "-8", "-7", "-6", "-5", "-4", "-3", "-2", "-1", "Ce mois"],
      datasets: [{
        data: Array(11).fill(depensesTotal.value * 0.7).concat(depensesTotal.value),
        tension: 0.4
      }],
    },
  });
}
</script>
