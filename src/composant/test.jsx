import React, { useState } from 'react';
import { ArrowRight, TrendingUp, DollarSign, Calculator } from 'lucide-react';


const Test = () => {
  // Devises disponibles dans le système
  const currencies = ['XOF', 'GNF', 'XAF', 'USDT', 'EUR', 'USD', 'RMB'];
  
  // État pour les taux de change (prix de vente actuels)
  const [exchangeRates, setExchangeRates] = useState({
    // Format: "DEVISE_SOURCE_DEVISE_DESTINATION": taux
    'XOF_USD': 0.0017,
    'USD_XOF': 600,
    'XOF_EUR': 0.0015,
    'EUR_XOF': 655,
    'USD_EUR': 0.92,
    'EUR_USD': 1.09,
    'GNF_USD': 0.00012,
    'USD_GNF': 8500,
    'XAF_EUR': 0.0015,
    'EUR_XAF': 655,
    'USDT_USD': 1.0,
    'USD_USDT': 1.0,
    'RMB_USD': 0.14,
    'USD_RMB': 7.2,
    'EUR_RMB': 7.8,
    'RMB_EUR': 0.128
  });

  // Prix d'achat historiques des devises (pour calculer la marge)
  const [purchasePrices, setPurchasePrices] = useState({
    'USD': 590,  // Prix d'achat en XOF
    'EUR': 640,  // Prix d'achat en XOF
    'USDT': 595, // Prix d'achat en XOF
    'GNF': 0.000115, // Prix d'achat en USD
    'RMB': 7.0   // Prix d'achat en USD
  });

  // État pour la transaction en cours
  const [transaction, setTransaction] = useState({
    amount: 100000,
    fromCurrency: 'XOF',
    toCurrency: 'EUR'
  });

  // Résultats de l'analyse
  const [results, setResults] = useState(null);

  // ====================================================================================
  // ÉTAPE 2 : RÉCUPÉRATION DES TAUX DE CHANGE
  // ====================================================================================
  // Fonction pour obtenir le taux direct ou via conversion
  
  const getDirectRate = (from, to) => {
    const key = `${from}_${to}`;
    return exchangeRates[key] || null;
  };

  // ====================================================================================
  // ÉTAPE 3 : GÉNÉRATION DES CHEMINS DE CONVERSION POSSIBLES
  // ====================================================================================
  // Cette fonction explore toutes les routes possibles : directes et intermédiaires
  
  const generateConversionPaths = (from, to) => {
    const paths = [];

    // Chemin 1 : Conversion directe (si disponible)
    const directRate = getDirectRate(from, to);
    if (directRate) {
      paths.push({
        path: [from, to],
        description: `Direct: ${from} → ${to}`,
        rates: [directRate]
      });
    }

    // Chemin 2 : Via USD (devise pivot principale)
    if (from !== 'USD' && to !== 'USD') {
      const toUSD = getDirectRate(from, 'USD');
      const fromUSD = getDirectRate('USD', to);
      if (toUSD && fromUSD) {
        paths.push({
          path: [from, 'USD', to],
          description: `Via USD: ${from} → USD → ${to}`,
          rates: [toUSD, fromUSD]
        });
      }
    }

    // Chemin 3 : Via EUR (devise pivot secondaire)
    if (from !== 'EUR' && to !== 'EUR') {
      const toEUR = getDirectRate(from, 'EUR');
      const fromEUR = getDirectRate('EUR', to);
      if (toEUR && fromEUR) {
        paths.push({
          path: [from, 'EUR', to],
          description: `Via EUR: ${from} → EUR → ${to}`,
          rates: [toEUR, fromEUR]
        });
      }
    }

    // Chemin 4 : Via USDT (stablecoin)
    if (from !== 'USDT' && to !== 'USDT') {
      const toUSDT = getDirectRate(from, 'USDT');
      const fromUSDT = getDirectRate('USDT', to);
      if (toUSDT && fromUSDT) {
        paths.push({
          path: [from, 'USDT', to],
          description: `Via USDT: ${from} → USDT → ${to}`,
          rates: [toUSDT, fromUSDT]
        });
      }
    }

    // Chemin 5 : Via RMB (pour transactions Chine)
    if (from !== 'RMB' && to !== 'RMB') {
      const toRMB = getDirectRate(from, 'RMB');
      const fromRMB = getDirectRate('RMB', to);
      if (toRMB && fromRMB) {
        paths.push({
          path: [from, 'RMB', to],
          description: `Via RMB: ${from} → RMB → ${to}`,
          rates: [toRMB, fromRMB]
        });
      }
    }

    // Chemin 6 : Double conversion USD → EUR
    if (from !== 'USD' && from !== 'EUR' && to !== 'USD' && to !== 'EUR') {
      const toUSD = getDirectRate(from, 'USD');
      const usdToEur = getDirectRate('USD', 'EUR');
      const eurToTarget = getDirectRate('EUR', to);
      if (toUSD && usdToEur && eurToTarget) {
        paths.push({
          path: [from, 'USD', 'EUR', to],
          description: `Via USD puis EUR: ${from} → USD → EUR → ${to}`,
          rates: [toUSD, usdToEur, eurToTarget]
        });
      }
    }

    return paths;
  };

  // ====================================================================================
  // ÉTAPE 4 : CALCUL DE LA MARGE POUR CHAQUE CHEMIN
  // ====================================================================================
  // Cette fonction calcule le montant final ET la marge bénéficiaire
  
  const calculatePathWithMargin = (path, amount) => {
    let currentAmount = amount;
    let totalCost = 0; // Coût total d'achat des devises utilisées
    
    // Conversion étape par étape
    const conversions = [];
    for (let i = 0; i < path.rates.length; i++) {
      const rate = path.rates[i];
      const fromCurr = path.path[i];
      const toCurr = path.path[i + 1];
      
      const newAmount = currentAmount * rate;
      conversions.push({
        from: fromCurr,
        to: toCurr,
        rate: rate,
        amountBefore: currentAmount,
        amountAfter: newAmount
      });
      
      currentAmount = newAmount;
    }

    // Calcul de la marge bénéficiaire
    // On compare le prix de vente actuel avec le prix d'achat historique
    let marginPercentage = 0;
    
    // Pour simplifier, on calcule la marge sur la devise intermédiaire principale
    const intermediateCurrency = path.path.length > 2 ? path.path[1] : null;
    
    if (intermediateCurrency && purchasePrices[intermediateCurrency]) {
      // Récupérer le taux de vente actuel
      const sellRate = getDirectRate(transaction.fromCurrency, intermediateCurrency);
      const buyRate = purchasePrices[intermediateCurrency];
      
      // Calcul de marge : (Prix vente - Prix achat) / Prix achat * 100
      if (sellRate && buyRate) {
        marginPercentage = ((sellRate - buyRate) / buyRate) * 100;
      }
    }

    return {
      ...path,
      finalAmount: currentAmount,
      conversions: conversions,
      marginPercentage: marginPercentage,
      netProfit: currentAmount * (marginPercentage / 100)
    };
  };

  // ====================================================================================
  // ÉTAPE 5 : SÉLECTION DU CHEMIN OPTIMAL
  // ====================================================================================
  // Compare tous les chemins et choisit celui avec la meilleure marge
  
  const findOptimalPath = () => {
    const { amount, fromCurrency, toCurrency } = transaction;
    
    // Générer tous les chemins possibles
    const paths = generateConversionPaths(fromCurrency, toCurrency);
    
    if (paths.length === 0) {
      setResults({
        error: `Aucun chemin de conversion trouvé entre ${fromCurrency} et ${toCurrency}`
      });
      return;
    }

    // Calculer le montant final et la marge pour chaque chemin
    const pathsWithResults = paths.map(path => 
      calculatePathWithMargin(path, amount)
    );

    // Trier par montant final (meilleure conversion)
    pathsWithResults.sort((a, b) => b.finalAmount - a.finalAmount);

    // Le meilleur chemin est celui qui donne le montant final le plus élevé
    const optimalPath = pathsWithResults[0];

    setResults({
      allPaths: pathsWithResults,
      optimalPath: optimalPath,
      savingsVsWorst: optimalPath.finalAmount - pathsWithResults[pathsWithResults.length - 1].finalAmount
    });
  };

  // ====================================================================================
  // INTERFACE UTILISATEUR
  // ====================================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center gap-3">
            <DollarSign className="w-10 h-10" />
            Système d'echange
          </h1>
          <p className="text-gray-600 mb-8">Optimisation automatique des marges bénéficiaires</p>

          {/* Formulaire de transaction */}
          <div className="bg-indigo-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4">Configuration de la Transaction</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Devise de départ</label>
                <select
                  value={transaction.fromCurrency}
                  onChange={(e) => setTransaction({...transaction, fromCurrency: e.target.value})}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Devise de destination</label>
                <select
                  value={transaction.toCurrency}
                  onChange={(e) => setTransaction({...transaction, toCurrency: e.target.value})}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
                <input
                  type="number"
                  value={transaction.amount}
                  onChange={(e) => setTransaction({...transaction, amount: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

            </div>

            <button
              onClick={findOptimalPath}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculer
            </button>
          </div>

          {/* Résultats */}
          {results && !results.error && (
            <div className="space-y-6">
              {/* Chemin optimal */}
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-900">Chemin Optimal </h2>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-lg font-semibold text-gray-800 mb-2">{results.optimalPath.description}</p>
                  <div className="flex items-center gap-2 text-3xl font-bold text-green-600">
                    {results.optimalPath.finalAmount.toFixed(2)} {transaction.toCurrency}
                  </div>
                  {results.optimalPath.marginPercentage > 0 && (
                    <p className="text-green-700 mt-2">
                      Marge bénéficiaire: +{results.optimalPath.marginPercentage.toFixed(2)}%
                    </p>
                  )}
                </div>

                {/* Détails des conversions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 mb-2">Détail des conversions:</h3>
                  {results.optimalPath.conversions.map((conv, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-indigo-900">{conv.from}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-indigo-900">{conv.to}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Taux: {conv.rate}</div>
                        <div className="font-semibold text-gray-800">
                          {conv.amountBefore.toFixed(2)} → {conv.amountAfter.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tous les chemins */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tous les Chemins Disponibles</h2>
                <div className="space-y-3">
                  {results.allPaths.map((path, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-white rounded-lg p-4 border ${idx === 0 ? 'border-green-500' : 'border-gray-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{path.description}</p>
                          <p className="text-sm text-gray-600">
                            Chemin: {path.path.join(' → ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">
                            {path.finalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">{transaction.toCurrency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {results && results.error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6">
              <p className="text-red-800 font-semibold">{results.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test;