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
  const transactionDirect = () => {
    if (!transaction.deviseDepart && !transaction.deviseDestination) return false
    return listeTaux.some(taux =>
      taux.deviseDepart === transaction.deviseDepart &&
      taux.deviseArrivee === transaction.deviseDestination
    )
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
      return {
        existe: true,
        montantFinal: montantFinal.toFixed(2),
        taux: tauxDirect.tauxActuel
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
          className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${
            formulaireComplet
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          Calculer les Chemins
          <ArrowRight size={24} />
        </button>
      </div>

      {!formulaireComplet && (
        <p className="text-center text-yellow-600 mt-4 font-medium">
           Veuillez remplir tous les champs pour continuer
        </p>
      )}



    </div>
  )
}

export default Transaction