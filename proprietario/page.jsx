'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProprietarioPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profilo, setProfilo] = useState(null)
  const [prenotazioni, setPrenotazioni] = useState([])
  const [utenti, setUtenti] = useState([])
  const [loading, setLoading] = useState(true)
  const [sezione, setSezione] = useState('prenotazioni')
  const [filtroData, setFiltroData] = useState('')
  const [filtroNome, setFiltroNome] = useState('')

  useEffect(() => { checkProprietario() }, [])

  const checkProprietario = async () => {
    let userId = null
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      userId = session.user.id
      setUser(session.user)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      userId = user.id
      setUser(user)
    }

    const { data: profiloData, error } = await supabase
      .from('profili')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profiloData) {
      router.push('/login')
      return
    }

    if (profiloData.ruolo !== 'proprietario') {
      router.push('/dashboard')
      return
    }

    setProfilo(profiloData)
    await Promise.all([caricaPrenotazioni(), caricaUtenti()])
    setLoading(false)
  }

  const caricaPrenotazioni = async () => {
    const { data, error } = await supabase
      .from('prenotazioni')
      .select(`*, profili ( id, nome_completo, email, telefono, bloccato ), campi ( nome, sport, struttura )`)
      .order('data', { ascending: false })
    if (!error) setPrenotazioni(data || [])
  }

  const caricaUtenti = async () => {
    const { data, error } = await supabase
      .from('profili')
      .select('*')
      .eq('ruolo', 'cliente')
      .order('nome_completo')
    if (!error) setUtenti(data || [])
  }

  const handleBloccoUtente = async (utente) => {
    const nuovoStato = !utente.bloccato
    const messaggio = nuovoStato
      ? `Bloccare ${utente.nome_completo}? Non potrà più prenotare i tuoi campi.`
      : `Sbloccare ${utente.nome_completo}?`
    if (!confirm(messaggio)) return

    if (nuovoStato) {
      await supabase
        .from('utenti_bloccati')
        .insert({ proprietario_id: user.id, utente_id: utente.id })
    } else {
      await supabase
        .from('utenti_bloccati')
        .delete()
        .eq('proprietario_id', user.id)
        .eq('utente_id', utente.id)
    }

    await Promise.all([caricaUtenti(), caricaPrenotazioni()])
  }

  const handleEliminaPrenotazione = async (id) => {
    if (!confirm('Eliminare questa prenotazione?')) return
    const { error } = await supabase.from('prenotazioni').delete().eq('id', id)
    if (!error) await caricaPrenotazioni()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const prenotazioniFiltrate = prenotazioni.filter(p => {
    const matchData = filtroData ? p.data === filtroData : true
    const matchNome = filtroNome
      ? p.profili?.nome_completo?.toLowerCase().includes(filtroNome.toLowerCase())
      : true
    return matchData && matchNome
  })

  const oggi = new Date().toISOString().split('T')[0]
  const prenotazioniOggi = prenotazioni.filter(p => p.data === oggi).length
  const utentiBloccati = utenti.filter(u => u.bloccato).length

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🏟️</div>
        <div className="text-2xl font-bold tracking-widest text-amber-600 uppercase">
          Caricamento Pannello...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap'); .bebas { font-family: 'Bebas Neue', sans-serif; } .dmsans { font-family: 'DM Sans', sans-serif; }`}</style>

      {/* HEADER */}
      <header className="bg-white border-b-2 border-amber-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-17 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-xl shadow-md">
              🏟️
            </div>
            <span className="bebas text-2xl tracking-widest">CAMPO<span className="text-amber-600">+</span></span>
            <span className="bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              ⭐ Proprietario
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Ciao, <strong className="text-slate-600">{profilo?.nome_completo?.split(' ')[0]}</strong>
            </span>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-50 border border-green-200 text-green-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-100 transition-all"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-white border border-red-200 text-red-500 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 py-12 relative overflow-hidden">
        <div className="absolute right-10 top-0 text-9xl opacity-10 rotate-6 pointer-events-none select-none">🏟️</div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-white/90 mb-4">
            🏟️ Pannello di Gestione
          </div>
          <div className="bebas text-5xl md:text-6xl text-white tracking-widest mb-3">
            CIAO, {profilo?.nome_completo?.split(' ')[0]?.toUpperCase()}!
          </div>
          <div className="text-white/70 font-light text-sm max-w-md">
            Gestisci prenotazioni, utenti e strutture dalla tua area riservata.
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 mb-0 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '📅 Prenotazioni totali', value: prenotazioni.length, color: 'text-green-600' },
            { label: '⚡ Oggi', value: prenotazioniOggi, color: 'text-blue-600' },
            { label: '👥 Utenti', value: utenti.length, color: 'text-amber-600' },
            { label: '🚫 Bloccati', value: utentiBloccati, color: 'text-red-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{s.label}</div>
              <div className={`bebas text-4xl ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit">
          {['prenotazioni', 'utenti'].map(tab => (
            <button
              key={tab}
              onClick={() => setSezione(tab)}
              className={`bebas text-lg tracking-widest px-7 py-2.5 rounded-xl transition-all border-none cursor-pointer ${
                sezione === tab
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              {tab === 'prenotazioni' ? '📅 Prenotazioni' : '👥 Utenti'}
            </button>
          ))}
        </div>

        {/* PRENOTAZIONI */}
        {sezione === 'prenotazioni' && (
          <>
            <div className="flex gap-3 mb-5 flex-wrap items-center">
              <input
                type="text"
                placeholder="🔍 Cerca per nome utente..."
                value={filtroNome}
                onChange={e => setFiltroNome(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 min-w-52 transition-all"
              />
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
              {(filtroNome || filtroData) && (
                <button
                  onClick={() => { setFiltroNome(''); setFiltroData('') }}
                  className="bg-red-50 border border-red-200 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all"
                >
                  ✕ Reset
                </button>
              )}
              <span className="text-sm text-slate-400 font-medium">{prenotazioniFiltrate.length} risultati</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Intestazione tabella - solo desktop */}
              <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_1.5fr_0.8fr_1fr] px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Utente</span><span>Campo</span><span>Data</span><span>Orario</span><span>Prezzo</span><span>Azioni</span>
              </div>

              {prenotazioniFiltrate.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-4">📅</div>
                  <div className="text-sm">Nessuna prenotazione trovata.</div>
                </div>
              ) : prenotazioniFiltrate.map(p => (
                <div key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-amber-50 transition-colors">
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[2fr_2fr_1.2fr_1.5fr_0.8fr_1fr] px-5 py-4 items-center">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{p.profili?.nome_completo || '—'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.profili?.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">{p.campi?.nome}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.campi?.struttura}</div>
                    </div>
                    <div className="text-sm text-slate-600">{p.data}</div>
                    <div>
                      <span className="inline-flex items-center bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        {p.ora_inizio} → {p.ora_fine}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">€{p.prezzo_totale}</div>
                    <div>
                      <button
                        onClick={() => handleEliminaPrenotazione(p.id)}
                        className="bg-red-50 border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 hover:border-red-400 transition-all cursor-pointer"
                      >
                        🗑️ Elimina
                      </button>
                    </div>
                  </div>
                  {/* Mobile card */}
                  <div className="md:hidden p-4">
                    <div className="font-bold text-slate-900 mb-3">{p.profili?.nome_completo}</div>
                    {[
                      ['Campo', p.campi?.nome],
                      ['Struttura', p.campi?.struttura],
                      ['Data', p.data],
                      ['Orario', `${p.ora_inizio} → ${p.ora_fine}`],
                      ['Prezzo', `€${p.prezzo_totale}`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>{label}</span><strong className="text-slate-800">{val}</strong>
                      </div>
                    ))}
                    <div className="mt-3">
                      <button
                        onClick={() => handleEliminaPrenotazione(p.id)}
                        className="w-full bg-red-50 border border-red-200 text-red-500 text-sm font-bold py-2 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
                      >
                        🗑️ Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* UTENTI */}
        {sezione === 'utenti' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Intestazione tabella - solo desktop */}
            <div className="hidden md:grid grid-cols-[2fr_2.5fr_1.5fr_1fr_1fr] px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Nome</span><span>Email</span><span>Telefono</span><span>Stato</span><span>Azioni</span>
            </div>

            {utenti.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-5xl mb-4">👥</div>
                <div className="text-sm">Nessun utente trovato.</div>
              </div>
            ) : utenti.map(u => (
              <div key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-amber-50 transition-colors">
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[2fr_2.5fr_1.5fr_1fr_1fr] px-5 py-4 items-center">
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{u.nome_completo}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {prenotazioni.filter(p => p.utente_id === u.id).length} prenotazioni
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">{u.email}</div>
                  <div className="text-sm text-slate-600">{u.telefono || '—'}</div>
                  <div>
                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${u.bloccato ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {u.bloccato ? '🚫 Bloccato' : '✅ Attivo'}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => handleBloccoUtente(u)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        u.bloccato
                          ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-400'
                          : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:border-red-400'
                      }`}
                    >
                      {u.bloccato ? '✅ Sblocca' : '🚫 Blocca'}
                    </button>
                  </div>
                </div>
                {/* Mobile card */}
                <div className="md:hidden p-4">
                  <div className="font-bold text-slate-900 mb-3">{u.nome_completo}</div>
                  {[
                    ['Email', u.email],
                    ['Telefono', u.telefono || '—'],
                    ['Prenotazioni', prenotazioni.filter(p => p.utente_id === u.id).length],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm text-slate-500 mb-2">
                      <span>{label}</span><strong className="text-slate-800">{val}</strong>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-500">Stato</span>
                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${u.bloccato ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {u.bloccato ? '🚫 Bloccato' : '✅ Attivo'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBloccoUtente(u)}
                    className={`w-full text-sm font-bold py-2 rounded-xl border transition-all cursor-pointer ${
                      u.bloccato
                        ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                        : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    {u.bloccato ? '✅ Sblocca' : '🚫 Blocca'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
