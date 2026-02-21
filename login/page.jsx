'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      if (signInError) throw signInError
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError('Email o password non validi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-wrap {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0a;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: none;
        }
        @media (min-width: 900px) { .left-panel { display: block; } }

        .field-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.7) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 60px,
              rgba(255,255,255,0.03) 60px,
              rgba(255,255,255,0.03) 61px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 60px,
              rgba(255,255,255,0.03) 60px,
              rgba(255,255,255,0.03) 61px
            ),
            linear-gradient(175deg, #1a6b2a 0%, #0d4a1a 40%, #0a3d14 70%, #071f0b 100%);
          background-size: cover;
        }

        /* campo da calcio stilizzato */
        .field-lines {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .field-lines svg {
          width: 75%;
          height: 75%;
          opacity: 0.18;
        }

        .left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 10px 18px;
          border-radius: 50px;
          width: fit-content;
        }
        .brand-badge span {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          color: #4ade80;
          letter-spacing: 2px;
        }

        .left-hero {
          animation: fadeUp 0.8s ease both;
          animation-delay: 0.2s;
        }
        .left-hero h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 6vw, 88px);
          color: #fff;
          line-height: 0.95;
          letter-spacing: 2px;
        }
        .left-hero h2 em {
          color: #4ade80;
          font-style: normal;
        }
        .left-hero p {
          color: rgba(255,255,255,0.6);
          font-size: 16px;
          margin-top: 20px;
          max-width: 340px;
          line-height: 1.6;
          font-weight: 300;
        }

        .stats-row {
          display: flex;
          gap: 32px;
          animation: fadeUp 0.8s ease both;
          animation-delay: 0.4s;
        }
        .stat {
          text-align: left;
        }
        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          color: #4ade80;
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 100%;
          max-width: 520px;
          background: #0f0f0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) { .right-panel { width: 480px; flex-shrink: 0; } }

        /* glow di sfondo */
        .right-panel::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -80px;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .right-panel::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -60px;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .form-box {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .form-box.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .form-header {
          margin-bottom: 40px;
        }
        .form-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #4ade80;
          margin-bottom: 12px;
        }
        .form-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px;
          color: #fff;
          line-height: 1;
          letter-spacing: 2px;
        }
        .form-sub {
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          margin-top: 10px;
          font-weight: 300;
        }

        .field-group {
          margin-bottom: 20px;
        }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 18px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          border-color: #4ade80;
          background: rgba(74,222,128,0.05);
          box-shadow: 0 0 0 3px rgba(74,222,128,0.1);
        }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-submit {
          width: 100%;
          background: #4ade80;
          color: #0a0a0a;
          border: none;
          border-radius: 10px;
          padding: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 3px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .btn-submit:hover:not(:disabled) {
          background: #22c55e;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(74,222,128,0.3);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .form-footer {
          margin-top: 28px;
          text-align: center;
        }
        .form-footer p {
          color: rgba(255,255,255,0.3);
          font-size: 13px;
        }
        .form-footer a, .form-footer .link {
          color: #4ade80;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .form-footer a:hover, .form-footer .link:hover { color: #86efac; }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 20px 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="login-wrap">

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div className="field-bg" />
          <div className="field-lines">
            {/* Disegno semplificato campo da calcio */}
            <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="396" height="276" stroke="white" strokeWidth="3"/>
              <line x1="200" y1="2" x2="200" y2="278" stroke="white" strokeWidth="2"/>
              <circle cx="200" cy="140" r="40" stroke="white" strokeWidth="2"/>
              <circle cx="200" cy="140" r="3" fill="white"/>
              {/* area sinistra */}
              <rect x="2" y="75" width="70" height="130" stroke="white" strokeWidth="2"/>
              <rect x="2" y="105" width="30" height="70" stroke="white" strokeWidth="2"/>
              {/* area destra */}
              <rect x="328" y="75" width="70" height="130" stroke="white" strokeWidth="2"/>
              <rect x="368" y="105" width="30" height="70" stroke="white" strokeWidth="2"/>
              {/* calcio d'angolo */}
              <path d="M2 2 Q12 2 12 12" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M398 2 Q388 2 388 12" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M2 278 Q12 278 12 268" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M398 278 Q388 278 388 268" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>

          <div className="left-content">
            <div className="brand-badge">
              <span>⚽ CAMPO+</span>
            </div>

            <div className="left-hero">
              <h2>PRENOTA<br />IL TUO<br /><em>CAMPO.</em></h2>
              <p>La piattaforma più veloce per prenotare campi da calcio nella tua città. In pochi click, sei in campo.</p>
            </div>

            <div className="stats-row">
              <div className="stat">
                <div className="stat-num">12+</div>
                <div className="stat-label">Campi</div>
              </div>
              <div className="stat">
                <div className="stat-num">500+</div>
                <div className="stat-label">Prenotazioni</div>
              </div>
              <div className="stat">
                <div className="stat-num">24/7</div>
                <div className="stat-label">Disponibile</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className={`form-box ${mounted ? 'visible' : ''}`}>

            <div className="form-header">
              <div className="form-eyebrow">Accesso</div>
              <div className="form-title">BENTORNATO</div>
              <div className="form-sub">Inserisci le tue credenziali per continuare</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="mario@example.com"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="error-box">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    ACCESSO IN CORSO
                  </span>
                ) : 'ACCEDI'}
              </button>
            </form>

            <div className="divider" />

            <div className="form-footer">
              <p>Non hai un account?{' '}
                <Link href="/registrazione" className="link">Registrati gratis</Link>
              </p>
              <p style={{ marginTop: '10px' }}>
                <a href="#">Password dimenticata?</a>
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
