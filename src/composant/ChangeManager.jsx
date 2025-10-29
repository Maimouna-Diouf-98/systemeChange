import { ArrowRight, Edit2Icon, Trash2 } from 'lucide-react';
import { useState } from 'react'
import { toast } from 'react-toastify';

function ChangeManager({ devises = [], listeTaux = [], setListeTaux, etape2 }) {
    const hierarchie = {
        USD: 1,
        EUR: 2,
        RMB: 3,
        USDT: 4,
        XOF: 5,
        XAF: 6,
        GNF: 7
    };

    // formulaire de change 
    const [formulaire, setFormulaire] = useState({
        deviseDepart: '',
        deviseArrivee: '',
        tauxActuel: '',

    });
    const [editId, setEditId] = useState(null);
    //mise a jour du formulaire
    const handleformChange = (champ, valeur) => {
        setFormulaire(prev => ({
            ...prev,
            [champ]: valeur
        }))
    }
    // Calculer la marge entre le prix d'achat et le prix achat historique
    // const calculeMarge = (prixVente, prixAchat) => {
    //     if (!prixAchat || prixAchat === 0) return 0
    //     return (((prixVente - prixAchat) / prixAchat) * 100).toFixed(6);
    // }
    // Fonction pour déterminer quelle devise est plus forte
    function devisesPlusFortePlusFaible(dev1, dev2) {
        if (hierarchie[dev1] < hierarchie[dev2]) {
            return { forte: dev1, faible: dev2 };
        } else {
            return { forte: dev2, faible: dev1 };
        }
    }

    const ajoutTaux = () => {
        if (!formulaire.deviseDepart || !formulaire.deviseArrivee
            || !formulaire.tauxActuel) {
            toast.info('Veuillez remplir tous les champs');
            return;
        }

        const {forte,faible}= devisesPlusFortePlusFaible(formulaire.deviseDepart,formulaire.deviseArrivee)
        if (!editId) {
            const existe = listeTaux.some(t =>
                (t.deviseDepart === forte && t.deviseArrivee === faible) ||
                (t.deviseDepart === faible && t.deviseArrivee === forte)
            );

            if (existe) {
                toast.error("Ce couple de devises est déjà enregistré !");
                return;
            }
        }
       
        if (editId) {
            // Mode édition → mise à jour
            const updated = listeTaux.map(t =>
                t.id === editId
                    ? {
                        ...t,
                        deviseDepart: forte,
                        deviseArrivee:faible,
                        tauxActuel:Number(parseFloat(formulaire.tauxActuel)) ,
                    }
                    : t
            );
            setListeTaux(updated);
            setEditId(null);
            toast.success("Taux modifié avec succès ");
        } else {
            // Mode ajout
            const nouveauTaux = {
                id: Date.now(),
                deviseDepart: forte,
                deviseArrivee: faible,
                tauxActuel:Number(parseFloat(formulaire.tauxActuel)),

            };
            setListeTaux(prev => [...prev, nouveauTaux]);
            toast.success("Taux ajouté avec succès ");
        }


        // Reset formulaire
        setFormulaire({
            deviseDepart: '',
            deviseArrivee: '',
            tauxActuel: '',

        });
    }
    const editTaux = (taux) => {
        setFormulaire({
            deviseDepart: taux.deviseDepart,
            deviseArrivee: taux.deviseArrivee,
            tauxActuel: taux.tauxActuel,

        });
        setEditId(taux.id);
    };

    const deleteTaux = (id) => {
        setListeTaux(prev => prev.filter(taux => taux.id !== id))
    }

console.log(listeTaux)
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                4️⃣ Taux d'Achat
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                placeholder="Ex: 650.0000"
                                value={formulaire.tauxActuel}
                                onChange={(e) => handleformChange('tauxActuel', e.target.value)}

                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />

                        </div>


                        <button
                            onClick={ajoutTaux}
                            className={`w-full mt-4 ${editId ? 'bg-blue-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} 
    text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl`}
                        >
                            {editId ? "Mettre à jour le Taux" : "Ajouter ce Taux de Change"}
                        </button>



                    </div>


                </div>
                {listeTaux.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Taux Enregistrés ({listeTaux.length})
                        </h2>

                        <div className="space-y-3">
                            {listeTaux.map((taux) => {

                                // Calculer le taux inverse (1 EUR = X XOF)
                                const tauxInverse = Number((1 / taux.tauxActuel).toFixed(6));

                                return (
                                    <div key={taux.id} className="border-2 border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                {/* Titre avec les devises */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-xl font-bold text-indigo-900">
                                                        {taux.deviseDepart} ⇄ {taux.deviseArrivee}
                                                    </span>

                                                </div>

                                                {/* NOUVEAU : Affichage des taux dans les deux sens */}
                                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {/* Sens 1 : XOF → EUR */}
                                                        <div className="flex items-center gap-2">

                                                            <span className="text-sm font-medium text-gray-700">
                                                                1 {taux.deviseDepart} =
                                                                <span className="ml-1 font-bold text-blue-700">
                                                                    {taux.tauxActuel} {taux.deviseArrivee}
                                                                </span>
                                                            </span>
                                                            {/* Sens 2 : EUR → XOF */}
                                                            <div className="flex items-center gap-2">

                                                                <span className="text-sm font-medium text-gray-700">
                                                                    1 {taux.deviseArrivee} =
                                                                    <span className="ml-1 font-bold text-purple-700">
                                                                        {tauxInverse} {taux.deviseDepart}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>


                                                    </div>
                                                </div>


                                            </div>

                                            {/* Bouton supprimer */}
                                            <button
                                                onClick={() => editTaux(taux)}
                                                className="ml-4 p-3 bg-green-100 hover:bg-green-200 text-white-600 rounded-lg transition-all"
                                                title="Modifier ce taux"
                                            >
                                                <Edit2Icon size={20} />
                                            </button>
                                            <button onClick={() => deleteTaux(taux.id)}
                                                className="ml-4 p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                                                title="Supprimer ce taux">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
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


        </div>
    )
}

export default ChangeManager