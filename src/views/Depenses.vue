<template>
  <div class="min-h-screen bg-gray-900 text-gray-200 p-6 flex flex-col items-center">
    <div class="w-full max-w-5xl bg-[#1e1e22] p-8 rounded-2xl shadow-xl">
      <h1 class="text-4xl font-bold text-center text-blue-300 mb-8">Gestion financière</h1>

      <!-- FORMULAIRE -->
      <div class="grid grid-cols-12 gap-6 mb-10">
        <!-- Catégorie -->
        <div class="col-span-4">
          <label class="block mb-1">Catégorie</label>
          <select
            v-model="nouvelle.categorie"
            class="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 focus:ring focus:ring-blue-500"
            required
          >
            <option disabled value="">Choisir...</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- Montant -->
        <div class="col-span-3">
          <label class="block mb-1">Montant ($)</label>
          <input
            type="text"
            inputmode="decimal"
            pattern="^\d*\.?\d{0,2}$"
            class="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 focus:ring focus:ring-blue-500"
            v-model.number="nouvelle.montant"
            required
          />
        </div>

        <!-- Type -->
        <div class="col-span-3">
          <label class="block mb-1 text-sm">Type</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="t in types"
              :key="t"
              class="cursor-pointer px-2 py-1 rounded-lg border border-gray-700 hover:bg-gray-700 text-sm"
              :class="{
                'bg-blue-600 text-white': nouvelle.type === t,
                'text-gray-200': nouvelle.type !== t,
              }"
            >
              <input type="radio" :value="t" v-model="nouvelle.type" class="hidden" />
              {{ t }}
            </label>
          </div>
        </div>

        <!-- Nature -->
        <div class="col-span-2">
          <label class="block mb-1 text-sm">Nature</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="n in natures"
              :key="n"
              class="cursor-pointer px-2 py-1 rounded-lg border border-gray-700 hover:bg-gray-700 text-sm"
              :class="{
                'bg-blue-600 text-white': nouvelle.nature === n,
                'text-gray-200': nouvelle.nature !== n,
              }"
            >
              <input type="radio" :value="n" v-model="nouvelle.nature" class="hidden" />
              {{ n }}
            </label>
          </div>
        </div>

        <!-- Ajouter + Date sur la même ligne -->
        <div class="col-span-12 flex items-end gap-2">
          <div v-if="nouvelle.type === 'Ponctuel' && nouvelle.nature === 'Dépense'">
            <input
              type="date"
              v-model="nouvelle.date"
              class="rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 focus:ring focus:ring-blue-500"
            />
          </div>

          <button
            @click="ajouter"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
          >
            Ajouter
          </button>
        </div>
      </div>

      <!-- TABLEAU -->
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-800">
          <tr>
            <th class="py-3 px-4 text-blue-300">Catégorie</th>
            <th class="py-3 px-4 text-blue-300">Montant</th>
            <th class="py-3 px-4 text-blue-300">Type</th>
            <th class="py-3 px-4 text-blue-300">Nature</th>
            <th class="py-3 px-4 text-blue-300 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(d, i) in toutes" :key="i" class="border-b border-gray-700">
            <td class="py-2 px-4">{{ d.categorie }}</td>
            <td class="py-2 px-4">{{ d.montant.toFixed(2) }} $</td>
            <td class="py-2 px-4">{{ d.type }}</td>
            <td class="py-2 px-4">{{ d.nature }}</td>

            <td class="py-2 px-4 text-center">
              <button
                @click="supprimer(i, d.nature)"
                class="text-red-400 hover:text-red-300 hover:scale-110 transition"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Export -->
      <div class="mt-10 flex gap-4">
        <button
          @click="exportCSV"
          class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Export CSV
        </button>

        <button
          @click="exportPDF"
          class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Export PDF
        </button>

        <input
          type="file"
          ref="fichierInput"
          accept=".csv,.json"
          class="hidden"
          @change="importerFichier"
        />

        <button
          @click="fichierInput.click()"
          class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Importer CSV/JSON
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import jsPDF from 'jspdf'
import { useFinancesStore } from '@/stores/finances'

const store = useFinancesStore()
const fichierInput = ref(null)

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

const types = ['Ponctuel', 'Hebdomadaire', 'Mensuel', 'Annuel']
const natures = ['Dépense', 'Revenu']

const nouvelle = reactive({
  categorie: '',
  montant: 0,
  type: '',
  nature: 'Dépense',
  date: '', // Nouvelle propriété
})

onMounted(() => {
  store.chargerDepuisLocalStorage()
})

const toutes = computed(() => store.toutes)

function ajouter() {
  if (!nouvelle.categorie || nouvelle.montant <= 0 || !nouvelle.type) return
  // Si ponctuel et dépense, on ajoute la date
  if (nouvelle.type === 'Ponctuel' && nouvelle.nature === 'Dépense' && !nouvelle.date) {
    nouvelle.date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  }

  store.ajouter({ ...nouvelle })

  // Reset
  nouvelle.categorie = ''
  nouvelle.montant = 0
  nouvelle.type = ''
  nouvelle.nature = 'Dépense'
  nouvelle.date = ''
}

function supprimer(index, nature) {
  store.supprimer(index, nature)
}

function exportCSV() {
  let contenu = 'Categorie,Montant,Type,Nature,Date\n'
  toutes.value.forEach((d) => {
    contenu += `${d.categorie},${d.montant},${d.type},${d.nature},${d.date || ''}\n`
  })

  const blob = new Blob([contenu], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'finances.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function exportPDF() {
  const pdf = new jsPDF()
  pdf.text('Résumé Financier', 10, 10)
  let y = 20
  toutes.value.forEach((d) => {
    pdf.text(
      `${d.categorie} - ${d.montant.toFixed(2)}$ (${d.type}, ${d.nature}${d.date ? ', ' + d.date : ''})`,
      10,
      y,
    )
    y += 8
  })
  pdf.save('finances.pdf')
}

function importerFichier(event) {
  const fichier = event.target.files?.[0]
  if (!fichier) return

  const reader = new FileReader()

  reader.onload = () => {
    const contenu = reader.result
    if (fichier.name.endsWith('.json')) {
      store.importerJSON(JSON.parse(contenu))
    } else if (fichier.name.endsWith('.csv')) {
      store.importerCSV(contenu)
    } else {
      alert('Format non supporté : utilisez .csv ou .json')
    }
  }

  reader.readAsText(fichier)
}
</script>
