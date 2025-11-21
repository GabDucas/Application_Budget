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
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 focus:ring focus:ring-blue-500"
            v-model.number="nouvelle.montant"
            required
          />
        </div>

        <!-- Type -->
        <div class="col-span-3">
          <label class="block mb-1">Type</label>
          <select
            class="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 focus:ring focus:ring-blue-500"
            v-model="nouvelle.type"
            required
          >
            <option disabled value="">Type...</option>
            <option>Ponctuel</option>
            <option>Hebdomadaire</option>
            <option>Mensuel</option>
            <option>Annuel</option>
          </select>
        </div>

        <!-- Dépense / revenu -->
        <div class="col-span-2">
          <label class="block mb-1">Nature</label>
          <select
            class="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 focus:ring focus:ring-blue-500"
            v-model="nouvelle.nature"
            required
          >
            <option>Dépense</option>
            <option>Revenu</option>
          </select>
        </div>

        <!-- Ajouter -->
        <div class="col-span-12 flex justify-end">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import jsPDF from 'jspdf'

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
]

const nouvelle = reactive({
  categorie: '',
  montant: 0,
  type: '',
  nature: 'Dépense',
})

const depenses = ref([])
const revenus = ref([])

onMounted(() => {
  depenses.value = JSON.parse(localStorage.getItem('depenses') || '[]')
  revenus.value = JSON.parse(localStorage.getItem('revenus') || '[]')
})

const toutes = computed(() => [...depenses.value, ...revenus.value])

function ajouter() {
  if (!nouvelle.categorie || nouvelle.montant <= 0 || !nouvelle.type) return

  const item = { ...nouvelle }

  if (item.nature === 'Dépense') depenses.value.push(item)
  else revenus.value.push(item)

  localStorage.setItem('depenses', JSON.stringify(depenses.value))
  localStorage.setItem('revenus', JSON.stringify(revenus.value))

  nouvelle.categorie = ''
  nouvelle.montant = 0
  nouvelle.type = ''
}

function supprimer(index, nature) {
  console.log('supprimer')
  if (nature === 'Dépense') {
    depenses.value.splice(index, 1)
    localStorage.setItem('depenses', JSON.stringify(depenses.value))
  } else {
    revenus.value.splice(index - depenses.value.length, 1)
    localStorage.setItem('revenus', JSON.stringify(revenus.value))
  }
}

function exportCSV() {
  let contenu = 'Categorie,Montant,Type,Nature\n'
  toutes.value.forEach((d) => {
    contenu += `${d.categorie},${d.montant},${d.type},${d.nature}\n`
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
    pdf.text(`${d.categorie} - ${d.montant.toFixed(2)}$ (${d.type}, ${d.nature})`, 10, y)
    y += 8
  })

  pdf.save('finances.pdf')
}
</script>
