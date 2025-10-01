import { ArrowRight, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react'
import { toast } from 'react-toastify';

function ChangeManager({ devises = [], listeTaux =[], setListeTaux, etape2 }) {

    // formulaire de change 
    const [formulaire, setFormulaire] = useState({
        deviseDepart: '',
        deviseArrivee: '',
        tauxActuel: '',
        prixAchatHistorique: '',
    });

    //mise a jour du formulaire
    const handleformChange = (champ, valeur) => {
        setFormulaire(prev => ({
            ...prev,
            [champ]: valeur
        }))
    }
    // Calculer la marge entre le prix d'achat et le prix achat historique
    const calculeMarge = (prixVente, prixAchat) => {
        if (!prixAchat || prixAchat === 0) return 0
        return (((prixVente - prixAchat) / prixAchat) * 100).toFixed(2);
    }
    const ajoutTaux = () => {
        if (!formulaire.deviseDepart || !formulaire.deviseArrivee
            || !formulaire.tauxActuel || !formulaire.prixAchatHistorique) {
            toast.info('Veuillez remplir tous les champs');
            return;
        }
        const nouveauTaux = {
            id: Date.now(),
            deviseDepart: formulaire.deviseDepart,
            deviseArrivee: formulaire.deviseArrivee,
            tauxActuel: parseFloat(formulaire.tauxActuel),
            prixAchatHistorique: parseFloat(formulaire.prixAchatHistorique)
        }

        setListeTaux(prev => [...prev, nouveauTaux]);


        setFormulaire({
            deviseDepart: '',
            deviseArrivee: '',
            tauxActuel: '',
            prixAchatHistorique: ''
        });


    }
    const deleteTaux = (id) => {
        setListeTaux(prev => prev.filter(taux => taux.id !== id))
    }


    return (
        <div className='"min-h-screen  p-6'>
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl  text-center font-bold text-gray-800 mb-4">
                        Ajouter un Taux de Change
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-xl">

                        <div className="">
                            <label className='block text-sm text-gray-700 font-semibold mb-2'>
                                1️⃣ Devise de Départ
                            </label>
                            <select
                                value={formulaire.deviseDepart}
                                onChange={(e) => handleformChange('deviseDepart', e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            >
                                <option value="">--- Sélectionnez ---</option>
                                {devises.map(devise => (
                                    <option key={devise} value={devise}>{devise}</option>
                                ))}

                            </select>
                            <p className="text-xs text-gray-500 mt-1">Exemple : XOF, EUR, USD</p>

                        </div>
                        <div className="">
                            <label className='block text-sm text-gray-700 font-semibold mb-2'>
                                2️⃣ Devise de Destination
                            </label>
                            <select
                                value={formulaire.deviseArrivee}
                                onChange={(e) => handleformChange('deviseArrivee', e.target.value)}

                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            >
                                <option value=""> --- Sélectionnez --- </option>

                                {devises.filter(d => (d !== formulaire.deviseDepart)).map(devise => (<option key={devise} value={devise}>{devise}</option>))}

                            </select>
                            <p className="text-xs text-gray-500 mt-1">Différente de la devise de départ</p>

                        </div>
                        <div className=''>
                            <label className='block text-sm text-gray-700 font-semibold mb-2'>
                                3️⃣ Taux de Change Actuel
                            </label>
                            <input
                                value={formulaire.tauxActuel}
                                onChange={(e) => handleformChange('tauxActuel', e.target.value)}

                                type="number"
                                step="0.0001"
                                placeholder="Ex: 655.5000"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Combien de {formulaire.deviseArrivee || '?'} pour 1 {formulaire.deviseDepart || '?'}
                            </p>
                        </div>
                        <div className=''>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                4️⃣ Prix d'Achat Historique
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                placeholder="Ex: 650.0000"
                                value={formulaire.prixAchatHistorique}
                                onChange={(e) => handleformChange('prixAchatHistorique', e.target.value)}

                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                À quel prix vous avez acheté cette devise ?
                            </p>
                        </div>
                        {formulaire.tauxActuel && formulaire.prixAchatHistorique && (
                            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">
                                    Marge prévisionnelle :
                                    <span className="text-2xl font-bold text-green-600 ml-2">
                                        {
                                            calculeMarge(parseFloat(formulaire.tauxActuel),
                                                parseFloat(formulaire.prixAchatHistorique))
                                        }%
                                    </span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Vous gagnez {(parseFloat(formulaire.tauxActuel) - parseFloat(formulaire.prixAchatHistorique)).toFixed(4)} par unité
                                </p>
                            </div>
                        )}

                        <button
                            onClick={ajoutTaux}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                            <PlusCircle size={24} />
                            Ajouter ce Taux de Change
                        </button>


                    </div>


                </div>
                {listeTaux.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Taux Enregistrés ({listeTaux.length})
                        </h2>
                        <div className="spacer-y-3">
                            {listeTaux.map((taux) => {
                                const marge = calculeMarge(taux.tauxActuel, taux.prixAchatHistorique);
                                const estPositif = parseFloat(marge) > 0;
                                return (
                                    <div
                                        key={taux.id}
                                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-2xl font-bold text-indigo-900">
                                                        {taux.deviseDepart} → {taux.deviseArrivee}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${estPositif
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {estPositif ? '✅' : '⚠️'} Marge: {marge}%
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Taux actuel:</span>
                                                        <span className="ml-2 font-bold text-gray-800">
                                                            {taux.tauxActuel.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Prix d'achat:</span>
                                                        <span className="ml-2 font-bold text-gray-800">
                                                            {taux.prixAchatHistorique.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                            <button
                                                onClick={() => deleteTaux(taux.id)}
                                                className="ml-4 p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                                                title="Supprimer ce taux"
                                            >
                                                <Trash2 size={20} />
                                            </button>

                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>

                )}
            </div>
            <button
                onClick={etape2}
                disabled={listeTaux.length === 0}
                className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${listeTaux.length > 0
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                Continuer vers la Transaction
                <ArrowRight size={24} />
            </button>

            {listeTaux.length === 0 && (
                <p className="text-center text-yellow-600 mt-4 font-medium">
                Vous devez ajouter au moins 1 taux pour continuer
                </p>
            )}
        </div>
    )
}

export default ChangeManager