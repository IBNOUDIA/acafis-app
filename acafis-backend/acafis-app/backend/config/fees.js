// Montants officiels de cotisation de la Coopérative ACAFIS
// Modifier ici seulement si l'AG vote un changement de montant.
module.exports = {
  PART_SOCIAL: 250000,        // Payé une seule fois, à l'adhésion
  COTISATION_ANNUELLE: 100000, // Payé chaque année, tant que le membre reste actif
  CURRENCY: 'FCFA',

  // Calcule le montant total dû par un membre depuis sa date d'adhésion
  // jusqu'à une date de référence (par défaut : aujourd'hui).
  calculerMontantDu(joinDate, asOfDate = new Date()) {
    const join = new Date(joinDate);
    let anneesEcoulees =
      asOfDate.getFullYear() - join.getFullYear() + 1; // année d'adhésion incluse
    if (anneesEcoulees < 1) anneesEcoulees = 1;

    return this.PART_SOCIAL + this.COTISATION_ANNUELLE * anneesEcoulees;
  },
};