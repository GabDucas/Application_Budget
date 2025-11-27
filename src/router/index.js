import { createRouter, createWebHistory } from 'vue-router'

// Pages
import DepensesPage from '../views/Depenses.vue'
import AffichagesPage from '../views/Affichage.vue'
import AnalysePage from '../views/Analyse.vue'
import BudgetPage from '../views/Budget.vue'

const routes = [
  {
    path: '/',
    redirect: '/depenses', // Redirection vers la page dépense par défaut
  },
  {
    path: '/depenses',
    name: 'depenses',
    component: DepensesPage,
  },
  {
    path: '/affichages',
    name: 'affichages',
    component: AffichagesPage,
  },
  {
    path: '/analyse',
    name: 'analyse',
    component: AnalysePage,
  },
  {
    path: '/budget',
    name: 'budget',
    component: BudgetPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
