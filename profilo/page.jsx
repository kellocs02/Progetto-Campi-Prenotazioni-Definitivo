//export default rende la funzione disponibile ad altri file
// Stai dicendo a Next.js:
// "Quando qualcuno va su /profilo,
//  mostra questa funzione"
//Devi solo sapere che ogni pagina in Next.js inizia sempre così:
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfiloPage() {
  const router = useRouter()
  const [utente, setUtente] = useState(null)
  const [profilo, setProfilo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfilo()
  }, [])

  const getProfilo = async () => {
    // Controlla se l'utente è loggato
    const { data: { user } } = await supabase.auth.getUser()

    // Se non è loggato, vai al login
    if (!user) {
      router.push('/login')
      return
    }

    setUtente(user)

    // Prendi i dati del profilo dal database
    const { data, error } = await supabase
      .from('profili')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.log('Errore:', error)
    } else {
      setProfilo(data)
    }

    setLoading(false)
  }

  // Mentre carica, mostra messaggio
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-xl">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-lg mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Il mio Profilo
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="text-lg font-semibold text-gray-800">
              {profilo?.nome_completo || 'Non specificato'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">
              {utente?.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Telefono</p>
            <p className="text-lg font-semibold text-gray-800">
              {profilo?.telefono || 'Non specificato'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Ruolo</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {profilo?.ruolo}
            </p>
          </div>
        </div>

        <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
          Modifica Profilo
        </button>

      </div>
    </div>
  )
}