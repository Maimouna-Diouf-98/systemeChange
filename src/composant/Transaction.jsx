import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'

function Transaction({ devises = [], listeTaux = [], transaction, setTransaction, etape1, etape3 }) {
  //mise a jour du formulaire
  const handleformChange = (champ, valeur) => {
    setTransaction(prev => ({
      ...prev,
      [champ]: valeur
    }))
  }

  const calculeTransaction = () => {
    if (!transaction.montant || !transaction.deviseDepart || !transaction.deviseDestination) {
      return null;
    }
    const tauxDirect = listeTaux.find(taux =>
      taux.deviseDepart === transaction.deviseDepart &&
      taux.deviseArrivee === transaction.deviseDestination)
    if (tauxDirect) {
      const montantFinal = parseFloat(transaction.montant) * tauxDirect.tauxActuel
      const tauxInverse = 1 / tauxDirect.tauxActuel
      return {
        existe: true,
        sensDirect: true,
        montantFinal: montantFinal.toFixed(9),
        taux: tauxDirect.tauxActuel,
        tauxInverse:tauxInverse
     
      };
    }
    const tauxInverse = listeTaux.find(taux =>
      taux.deviseDepart === transaction.deviseDestination &&
      taux.deviseArrivee === transaction.deviseDepart
    )

    if (tauxInverse) {
      const tauxCalcule = 1 / tauxInverse.tauxActuel;
      const montantFinal = parseFloat(transaction.montant) * tauxCalcule
      return {
        existe: true,
        sensDirect: false,
        montantFinal: montantFinal.toFixed(9),
        taux: tauxCalcule,
        tauxInverse: tauxInverse.tauxActuel
      };
    }
    return { existe: false };
  }
  const apercu = calculeTransaction()
  const formulaireComplet = transaction.montant && transaction.deviseDepart && transaction.deviseDestination;


  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">
          Taux disponibles ({listeTaux.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {listeTaux.map(taux => (
            <span key={taux.id} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              {taux.deviseDepart} → {taux.deviseArrivee}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Nouvelle Transaction
        </h2>

        {/* CHAMP 1 : Montant */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            1️⃣ Montant initial
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={transaction.montant}
              onChange={(e) => handleformChange('montant', e.target.value)}
              placeholder="Ex: 100000"
              className="w-full p-4 pr-20 border-2 border-gray-300 rounded-lg text-2xl font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            {transaction.deviseDepart && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-indigo-600">
                {transaction.deviseDepart}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Le montant que vous voulez convertir
          </p>
        </div>

        {/* CHAMP 2 : Devise de départ */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            2️⃣ Devise de départ
          </label>
          <select
            value={transaction.deviseDepart}
            onChange={(e) => handleformChange('deviseDepart', e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">-- Sélectionnez la devise de départ --</option>
            {devises.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* CHAMP 3 : Devise de destination */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            3️⃣Devise de destination
          </label>
          <select
            value={transaction.deviseDestination}
            onChange={(e) => handleformChange('deviseDestination', e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">-- Sélectionnez la devise de destination --</option>
            {devises.filter(d => d !== transaction.deviseDepart).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {/* AFFICHAGE BIDIRECTIONNEL UNIQUEMENT SI LES 2 DEVISES SONT CHOISIES */}
        {transaction.deviseDepart && transaction.deviseDestination && apercu && (
          <div className={`p-6 rounded-lg border-2 ${apercu.existe
              ? 'bg-green-50 border-green-500'
              : 'bg-yellow-50 border-yellow-500'
            }`}>
            {apercu.existe ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ✓ Taux disponible
                  </div>
                 
                </div>

                {/* Affichage bidirectionnel */}
                <div className="bg-white rounded-lg p-5 border-2 border-green-200">
                  <p className="text-xs text-gray-600 mb-3 font-semibold uppercase">Taux de change</p>
                  <div className="space-y-3">
                    {/* Sens de la transaction choisie */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                          →
                        </span>
                        <span className="text-sm font-medium">
                          1 {transaction.deviseDepart} =
                          <span className="ml-2 text-lg font-bold text-blue-700">
                            {apercu.taux.toFixed(8)}
                          </span>
                          <span className="ml-1 font-bold text-blue-700">
                            {transaction.deviseDestination}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Sens inverse */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                          ←
                        </span>
                        <span className="text-sm font-medium">
                          1 {transaction.deviseDestination} =
                          <span className="ml-2 text-lg font-bold text-purple-700">
                            {apercu.tauxInverse}
                          </span>
                          <span className="ml-1 font-bold text-purple-700">
                            {transaction.deviseDepart}
                          </span>
                          
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div>
                <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-3">
                  ⚠ Aucun taux direct
                </div>
                <p className="text-yellow-700 text-sm font-medium mb-2">
                  Aucun taux direct entre {transaction.deviseDepart} et {transaction.deviseDestination}
                </p>
                
              </div>
            )}
          </div>
        )}


      </div>
      {/* BOUTONS DE NAVIGATION */}
      <div className="flex gap-4">
        <button onClick={etape1}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-lg flex items-center justify-center gap-2">
          <ArrowLeft size={24} />
          Retour
        </button>

        <button
          onClick={etape3}
          disabled={!formulaireComplet}
          className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${formulaireComplet
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}>
          Calculer les Chemins
          <ArrowRight size={24} />
        </button>
      </div>





    </div>
  )
}

export default Transaction