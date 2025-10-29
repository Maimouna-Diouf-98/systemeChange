import React, { useState } from 'react'
import IndicateurEtapes from './IndicateurEtapes'
import ChangeManager from './ChangeManager';
import Transaction from './Transaction';
import OptimalChange from './OptimalChange';
function SystemeChange() {
     // ÉTAT : Quelle étape afficher (1 ou 2)
  const [etapeActuelle, setEtapeActuelle] = useState(1);
  
  // DONNÉES PARTAGÉES : Déclarées ici pour être accessibles par toutes les étapes
  const devises = ['XOF', 'GNF', 'XAF', 'USDT', 'EUR', 'USD', 'RMB'];
  
  const [listeTaux, setListeTaux] = useState([]);
  const [transaction, setTransaction] = useState({
    montant: '',
    deviseDepart: '',
    deviseDestination: ''
  });
  const [resultatsCalcul, setResultatsCalcul] = useState(null);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
      
        {/* INDICATEUR D'ÉTAPES */}
        <IndicateurEtapes etapeActuelle={etapeActuelle} />
        {etapeActuelle === 1 && (
          <ChangeManager
            devises={devises}
            listeTaux={listeTaux}
            setListeTaux={setListeTaux}
            etape2={() => setEtapeActuelle(2)}
          />
        )}
        
        {etapeActuelle === 2 && (
          <Transaction
            devises={devises}
            listeTaux={listeTaux}
            transaction={transaction}
            setTransaction={setTransaction}
            etape1={() => setEtapeActuelle(1)}
            etape3={() => setEtapeActuelle(3)}
          />
        )}
        
        {etapeActuelle === 3 && (
          <OptimalChange
            listeTaux={listeTaux}
            transaction={transaction}
            setResultat={setResultatsCalcul}
            etape2={() => setEtapeActuelle(2)}
            etape1= {() => setEtapeActuelle(1)}
          />
        )}

      </div>
    </div>
  )
}

export default SystemeChange