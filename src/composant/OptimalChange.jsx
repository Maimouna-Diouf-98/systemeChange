import { ArrowLeft, ArrowRight, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react'

function OptimalChange({ listeTaux = [], transaction, setResultat, etape2 }) {
  const [chemins, setChemins] = useState([]);
  const [calcul, setCalcul] = useState(true);
  const devisesIntermediaires = ['XOF', 'GNF', 'XAF', 'USDT', 'EUR', 'USD', 'RMB'];
  useEffect(() => {
    calculerChemins();
  }, []);
 const calculerChemins = () => {
    setCalcul(true);
    setTimeout(() => {
      const montant = parseFloat(transaction.montant);
      const depart = transaction.deviseDepart;
      const destination = transaction.deviseDestination;
      const allChemins = [];

      // Ajouter chemin direct et inverse
      listeTaux.forEach(t => {
        if (t.deviseDepart === depart && t.deviseArrivee === destination) {
          const montantFinal = montant * t.tauxActuel;
          allChemins.push({
            chemin: `${depart} → ${destination}`,
            etapes: [
              { devise: depart, montant },
              { devise: destination, montant: montantFinal }
            ],
            montantFinal,
            details: `Direct`
          });
        }
        if (t.deviseDepart === destination && t.deviseArrivee === depart) {
          const montantFinal = montant * (1 / t.tauxActuel);
          allChemins.push({
            chemin: `${depart} → ${destination}`,
            etapes: [
              { devise: depart, montant },
              { devise: destination, montant: montantFinal }
            ],
            montantFinal,
            details: `Inverse`
          });
        }
      });

      // Chemins intermédiaires
      devisesIntermediaires.forEach(inter => {
        if (inter === depart || inter === destination) return;
        const taux1 = listeTaux.find(t => t.deviseDepart === depart && t.deviseArrivee === inter);
        const taux2 = listeTaux.find(t => t.deviseDepart === inter && t.deviseArrivee === destination);
        const taux1Inverse = listeTaux.find(t => t.deviseDepart === inter && t.deviseArrivee === depart);
        const taux2Inverse = listeTaux.find(t => t.deviseDepart === destination && t.deviseArrivee === inter);

        if (taux1 && taux2) {
          const montantInter = montant * taux1.tauxActuel;
          const montantFinal = montantInter * taux2.tauxActuel;
          allChemins.push({
            chemin: `${depart} → ${inter} → ${destination}`,
            etapes: [
              { devise: depart, montant },
              { devise: inter, montant: montantInter },
              { devise: destination, montant: montantFinal }
            ],
            montantFinal,
            details: `Via ${inter}`
          });
        }

        if (taux1Inverse && taux2) {
          const montantInter = montant * (1 / taux1Inverse.tauxActuel);
          const montantFinal = montantInter * taux2.tauxActuel;
          allChemins.push({
            chemin: `${depart} → ${inter} → ${destination}`,
            etapes: [
              { devise: depart, montant },
              { devise: inter, montant: montantInter },
              { devise: destination, montant: montantFinal }
            ],
            montantFinal,
            details: `Via ${inter} (inverse étape 1)`
          });
        }

        if (taux1 && taux2Inverse) {
          const montantInter = montant * taux1.tauxActuel;
          const montantFinal = montantInter * (1 / taux2Inverse.tauxActuel);
          allChemins.push({
            chemin: `${depart} → ${inter} → ${destination}`,
            etapes: [
              { devise: depart, montant },
              { devise: inter, montant: montantInter },
              { devise: destination, montant: montantFinal }
            ],
            montantFinal,
            details: `Via ${inter} (inverse étape 2)`
          });
        }

        if (taux1Inverse && taux2Inverse) {
          const montantInter = montant * (1 / taux1Inverse.tauxActuel);
          const montantFinal = montantInter * (1 / taux2Inverse.tauxActuel);
          allChemins.push({
            chemin: `${depart} → ${inter} → ${destination}`,
            etapes: [
              { devise: depart, montant },
              { devise: inter, montant: montantInter },
              { devise: destination, montant: montantFinal }
            ],
            montantFinal,
            details: `Via ${inter} (inverse étape 1 & 2)`
          });
        }
      });

      // Trier pour le meilleur chemin
allChemins.sort((a, b) => a.montantFinal - b.montantFinal);

      setChemins(allChemins);
      setCalcul(false);
      if (allChemins.length > 0) setResultat(allChemins[0]);
    }, 1500);
  };
console.log(chemins)
  return (
    <div>


      {/* RÉCAPITULATIF DE LA TRANSACTION */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Récapitulatif</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Montant</p>
            <p className="text-2xl font-bold text-indigo-900">{transaction.montant}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">De</p>
            <p className="text-2xl font-bold text-green-700">{transaction.deviseDepart}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Vers</p>
            <p className="text-2xl font-bold text-purple-700">{transaction.deviseDestination}</p>
          </div>
        </div>
      </div>

      {/* ANIMATION DE CALCUL */}
      {calcul && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Calcul en cours...</h3>
          <p className="text-gray-600">Analyse de tous les chemins possibles</p>

        </div>
      )}

      {/* RÉSULTATS DES CALCULS */}
      {!calcul && (
        <>
          {chemins.length === 0 ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
              <p className="text-red-700 font-bold text-lg mb-2"> Aucun chemin trouvé</p>
              <p className="text-red-600 text-sm">
                Il n'existe aucune combinaison de taux permettant de convertir {transaction.deviseDepart} en {transaction.deviseDestination}.
              </p>
              <p className="text-red-600 text-sm mt-2">
                Retournez à l'étape 1 pour ajouter les taux manquants.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Chemins Trouvés ({chemins.length})
              </h2>

              {chemins.map((chemin, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-6 transition-all ${index === 0
                      ? 'border-green-500 bg-green-50 shadow-xl'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                >
                  {/* BADGE OPTIMAL */}
                  {index === 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <TrendingUp size={16} />
                        CHEMIN OPTIMAL
                      </span>

                    </div>
                  )}

                  {/* EN-TÊTE DU CHEMIN */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{chemin.chemin}</h3>
                    </div>

                  </div>

                  {/* VISUALISATION DES ÉTAPES */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      {chemin.etapes.map((etape, idx) => (
                        <React.Fragment key={idx}>
                          <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${idx === 0
                                ? 'bg-blue-100 text-blue-700'
                                : idx === chemin.etapes.length - 1
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {etape.devise}
                            </div>
                            <p className="text-lg font-bold text-gray-800">
                              {etape.montant.toFixed(6)}
                            </p>
                          </div>

                          {idx < chemin.etapes.length - 1 && (
                            <ArrowRight className="text-gray-400" size={32} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* MONTANT FINAL */}
                  <div className={`p-4 rounded-lg ${index === 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Vous recevrez :</span>
                      <span className={`text-2xl font-bold ${index === 0 ? 'text-green-700' : 'text-gray-800'
                        }`}>
                        {chemin.montantFinal.toFixed(6)} {transaction.deviseDestination}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* TABLEAU COMPARATIF */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tableau Comparatif</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Rang</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Chemin</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Montant Final</th>

                      </tr>
                    </thead>
                    <tbody>
                      {chemins.map((chemin, index) => (
                        <tr key={index} className={`border-b border-gray-100 ${index === 0 ? 'bg-green-50' : ''
                          }`}>
                          <td className="py-3 px-4">
                            {index === 0 ? (
                              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                1
                              </span>
                            ) : (
                              <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{chemin.chemin}</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {chemin.montantFinal.toFixed(6)} {transaction.deviseDestination}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>
          )}
        </>
      )}

      {/* BOUTON RETOUR */}
      <div className="mt-6">
        <button
          onClick={etape2}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft size={24} />
          Modifier la Transaction
        </button>
      </div>
    </div>
  );
}

export default OptimalChange