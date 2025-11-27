<template>
  <div class="min-h-screen w-full bg-gray-900 text-gray-200 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- TITRE -->
      <h1 class="text-3xl font-extrabold text-center mb-8 text-blue-300">
        Budgets par catégorie
      </h1>

      <!-- FILTRES ET RÉSUMÉ -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-800 shadow-md rounded-lg p-5">
          <p class="text-gray-400 text-sm mb-1">Catégories avec budget:</p>
          <p class="text-2xl font-bold text-blue-400">{{ categoriesAvecBudget }}</p>
        </div>
        <div class="bg-gray-800 shadow-md rounded-lg p-5">
          <p class="text-gray-400 text-sm mb-1">Budget total mensuel:</p>
          <p class="text-2xl font-bold text-green-400">{{ budgetTotalMensuel.toFixed(2) }} $</p>
        </div>
        <div class="bg-gray-800 shadow-md rounded-lg p-5">
          <p class="text-gray-400 text-sm mb-1">Dépensé ce mois:</p>
          <p class="text-2xl font-bold text-red-400">{{ depenseTotaleMois.toFixed(2) }} $</p>
        </div>
      </div>

      <!-- FORMULAIRE POUR DÉFINIR UN BUDGET -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 class="text-xl font-bold mb-4 text-blue-300">Définir un budget</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">Catégorie</label>
            <select
              v-model="nouvelleBudget.categorie"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Sélectionner...</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-2">Budget mensuel ($)</label>
            <input
              v-model.number="nouvelleBudget.montant"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 500.00"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="definirBudget"
              :disabled="!nouvelleBudget.categorie || !nouvelleBudget.montant"
              class="w-full px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              Définir le budget
            </button>
          </div>
        </div>
      </div>

      <!-- LISTE DES BUDGETS PAR CATÉGORIE -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4 text-blue-300">Budgets par catégorie</h2>

        <div
          v-for="categorie in categoriesTriees"
          :key="categorie"
          class="bg-gray-800 p-5 rounded-lg shadow-md"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-bold">{{ categorie }}</h3>
              <p class="text-sm text-gray-400">
                Budget: {{ budgetCategorie(categorie).toFixed(2) }} $ / mois
              </p>
            </div>
            <button
              @click="supprimerBudget(categorie)"
              class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition"
            >
              Supprimer
            </button>
          </div>

          <!-- Montants -->
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p class="text-sm text-gray-400">Dépensé ce mois:</p>
              <p class="text-xl font-bold" :class="couleurDepense(categorie)">
                {{ depenseMoisCategorie(categorie).toFixed(2) }} $
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Restant:</p>
              <p class="text-xl font-bold" :class="couleurRestant(categorie)">
                {{ restantCategorie(categorie).toFixed(2) }} $
              </p>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="couleurBarre(categorie)"
              :style="{ width: `${Math.min(pourcentageDepense(categorie), 100)}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-400 mt-1 text-right">
            {{ pourcentageDepense(categorie).toFixed(1) }}% du budget utilisé
          </p>

          <!-- Alerte -->
          <div
            v-if="pourcentageDepense(categorie) >= 90"
            class="mt-3 p-3 rounded-lg"
            :class="
              pourcentageDepense(categorie) >= 100
                ? 'bg-red-900/30 border border-red-600'
                : 'bg-yellow-900/30 border border-yellow-600'
            "
          >
            <p class="text-sm">
              <span v-if="pourcentageDepense(categorie) >= 100" class="font-bold text-red-400"
                >⚠️ Budget dépassé!</span
              >
              <span v-else class="font-bold text-yellow-400">⚠️ Attention!</span>
              Vous approchez de votre limite de budget pour cette catégorie.
            </p>
          </div>
        </div>

        <!-- Message si aucun budget -->
        <div
          v-if="categoriesTriees.length === 0"
          class="bg-gray-800 p-8 rounded-lg text-center text-gray-400"
        >
          <p class="text-lg">Aucun budget défini pour le moment.</p>
          <p class="text-sm mt-2">Utilisez le formulaire ci-dessus pour définir vos budgets.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useFinancesStore } from '@/stores/finances'

const store = useFinancesStore()

const categories = [
  'Alimentation',
  'Transport',
  'Logement',
  'Divertissement',
  'Santé',
  'Éducation',
  'Épargne',
  'Loisirs',
  'Autres',
  'Services',
  'Assurances',
  'Abonnements',
  'Investissements',
]

const nouvelleBudget = reactive({
  categorie: '',
  montant: null,
})

onMounted(() => {
  store.chargerDepuisLocalStorage()
})

// Fonction pour transformer en équivalent mensuel
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

// Calculer les dépenses du mois pour une catégorie
function depenseMoisCategorie(categorie) {
  return store.depenses
    .filter((d) => d.categorie === categorie)
    .reduce((total, d) => total + montantMensuel(d), 0)
}

// Budget pour une catégorie
function budgetCategorie(categorie) {
  return store.budgets[categorie] || 0
}

// Restant pour une catégorie
function restantCategorie(categorie) {
  return budgetCategorie(categorie) - depenseMoisCategorie(categorie)
}

// Pourcentage dépensé
function pourcentageDepense(categorie) {
  const budget = budgetCategorie(categorie)
  if (budget === 0) return 0
  return (depenseMoisCategorie(categorie) / budget) * 100
}

// Couleurs dynamiques
function couleurDepense(categorie) {
  const pct = pourcentageDepense(categorie)
  if (pct >= 100) return 'text-red-400'
  if (pct >= 90) return 'text-yellow-400'
  return 'text-blue-400'
}

function couleurRestant(categorie) {
  const restant = restantCategorie(categorie)
  if (restant < 0) return 'text-red-400'
  if (restant < budgetCategorie(categorie) * 0.1) return 'text-yellow-400'
  return 'text-green-400'
}

function couleurBarre(categorie) {
  const pct = pourcentageDepense(categorie)
  if (pct >= 100) return 'bg-red-500'
  if (pct >= 90) return 'bg-yellow-500'
  if (pct >= 75) return 'bg-orange-500'
  return 'bg-green-500'
}

// Catégories triées par budget (avec budget défini seulement)
const categoriesTriees = computed(() => {
  return Object.keys(store.budgets).sort((a, b) => {
    return pourcentageDepense(b) - pourcentageDepense(a)
  })
})

// Statistiques globales
const categoriesAvecBudget = computed(() => Object.keys(store.budgets).length)
const budgetTotalMensuel = computed(() =>
  Object.values(store.budgets).reduce((a, b) => a + b, 0),
)
const depenseTotaleMois = computed(() =>
  store.depenses.reduce((total, d) => total + montantMensuel(d), 0),
)

// Actions
function definirBudget() {
  if (!nouvelleBudget.categorie || !nouvelleBudget.montant || nouvelleBudget.montant <= 0) {
    return
  }
  store.definirBudget(nouvelleBudget.categorie, nouvelleBudget.montant)
  nouvelleBudget.categorie = ''
  nouvelleBudget.montant = null
}

function supprimerBudget(categorie) {
  if (confirm(`Supprimer le budget pour "${categorie}" ?`)) {
    store.supprimerBudget(categorie)
  }
}
</script>
