import { defineStore } from "pinia";

export const useFinancesStore = defineStore("finances", {
  state: () => ({
    depenses: [],
    revenus: [],
  }),

  getters: {
    toutes: (state) => [...state.depenses, ...state.revenus],
  },

  actions: {
    chargerDepuisLocalStorage() {
      this.depenses = JSON.parse(localStorage.getItem("depenses") || "[]");
      this.revenus = JSON.parse(localStorage.getItem("revenus") || "[]");
    },

    sauvegarder() {
      localStorage.setItem("depenses", JSON.stringify(this.depenses));
      localStorage.setItem("revenus", JSON.stringify(this.revenus));
    },

    ajouter(item) {
      if (item.nature === "Dépense") this.depenses.push(item);
      else this.revenus.push(item);

      this.sauvegarder();
    },

    supprimer(index, nature) {
      if (nature === "Dépense") this.depenses.splice(index, 1);
      else this.revenus.splice(index - this.depenses.length, 1);

      this.sauvegarder();
    },

    importerJSON(jsonData) {
      if (jsonData.depenses) this.depenses = jsonData.depenses;
      if (jsonData.revenus) this.revenus = jsonData.revenus;
      this.sauvegarder();
    },

    importerCSV(csvText) {
      const lignes = csvText.trim().split("\n").slice(1);

      const dep = [];
      const rev = [];

      lignes.forEach((ligne) => {
        const [categorie, montant, type, nature] = ligne.split(",");

        const obj = {
          categorie,
          montant: Number(montant),
          type,
          nature,
        };

        if (nature === "Dépense") dep.push(obj);
        else rev.push(obj);
      });

      this.depenses = dep;
      this.revenus = rev;
      this.sauvegarder();
    },
  },
});
