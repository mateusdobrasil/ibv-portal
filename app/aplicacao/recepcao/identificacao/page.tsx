'use client'

import Header from "@/components/site/SiteHeader";
import Footer from "@/components/site/SiteFooter";
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { confirmarIdentificacaoRecepcao } from '@/app/aplicacao/actions/recepcao-auth'

export default function IdentificacaoRecepcao() {
  const [congregacao, setCongregacao] = useState('')
  const [nome, setNome]               = useState('')
  const [erro, setErro]               = useState(false)
  const [carregando, setCarregando]   = useState(false)

  useEffect(() => {
    const cookieCongregacao = document.cookie
      .split('; ')
      .find(row => row.startsWith('recepcao_congregacao='))
      ?.split('=')[1]
    if (cookieCongregacao) setCongregacao(decodeURIComponent(cookieCongregacao))
  }, [])

  async function continuar() {
    if (!nome.trim() || carregando) return
    setCarregando(true)
    setErro(false)

    // Em caso de sucesso, a action já redireciona a partir do servidor.
    const { ok } = await confirmarIdentificacaoRecepcao(nome)

    if (!ok) {
      setErro(true)
      setCarregando(false)
    }
  }

  return (
    <>
    <Header />
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <Image
            src="/imgs/logo.png"
            alt="AD Vinhedo"
            width={140}
            height={90}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <h1 style={s.titulo}>Identificação</h1>
        <p style={s.sub}>
          {congregacao ? <>Acesso da congregação <b>{congregacao}</b></> : 'Antes de continuar'}
          <br />Informe seu nome para prosseguir
        </p>

        <input
          style={{ ...s.input, ...(erro ? s.inputErro : {}) }}
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={e => { setNome(e.target.value); setErro(false) }}
          onKeyDown={e => e.key === 'Enter' && continuar()}
          autoFocus
          disabled={carregando}
        />
        {erro && <p style={s.erroMsg}>Informe um nome válido.</p>}

        <button
          style={{ ...s.btn, opacity: carregando ? 0.7 : 1 }}
          onClick={continuar}
          disabled={carregando}>
          {carregando ? 'Entrando...' : 'Continuar'}
        </button>
      </div>
    </div>
    <Footer />
  </>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap:     { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24 },
  card:     { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  logoWrap: { marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  titulo:   { fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px', textAlign: 'center' },
  sub:      { fontSize: 13, color: '#6B7280', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.6 },
  input:    { width: '100%', padding: '11px 14px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'inherit' },
  inputErro:{ borderColor: '#F87171', background: '#FFF5F5' },
  erroMsg:  { fontSize: 12, color: '#DC2626', alignSelf: 'flex-start', margin: '-4px 0 8px' },
  btn:      { width: '100%', padding: '12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
}
