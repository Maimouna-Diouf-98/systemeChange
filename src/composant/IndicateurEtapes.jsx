import { ArrowRight } from 'lucide-react'
import React from 'react'

function IndicateurEtapes({ etapeActuelle }) {
   const etapes = [
    { num: 1, titre: 'Taux de Change',  },
    { num: 2, titre: 'Transaction', },
    { num: 3, titre: 'Calcul Meilleur Chemin',  }
  ];

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {etapes.map((etape, index) => (
        <React.Fragment key={etape.num}>
          <div className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold transition-all ${
            etapeActuelle === etape.num 
              ? 'bg-blue-600 text-white shadow-lg scale-110' 
              : etapeActuelle > etape.num
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            
            <span className="hidden md:inline">{etape.titre}</span>
          </div>
          
          {index < etapes.length - 1 && (
            <ArrowRight className="text-gray-400" size={24} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default IndicateurEtapes