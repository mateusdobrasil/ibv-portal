'use client'

import { useState, useTransition } from 'react'
import { dispararRedefinicaoSenha } from '../actions/senha'

export default function BotaoResetSenha({ email, modulo }: { email: string, modulo: 'ebd' | 'ibv' | 'ibuc' }) {
  const [isPending, startTransition] = useTransition()
  const [enviado, setEnviado] = useState(false)

  const handleClick = () => {
    if (!email) {
      alert('Este usuário não tem e-mail cadastrado.')
      return
    }
    if (!window.confirm(`Enviar um link de redefinição de senha para ${email}?`)) return

    startTransition(async () => {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('origin', window.location.origin)
      await dispararRedefinicaoSenha(formData)
      setEnviado(true)
      setTimeout(() => setEnviado(false), 4000)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold transition shadow-sm border border-amber-100 disabled:opacity-50"
      title="Enviar link de redefinição de senha para este usuário"
    >
      {isPending ? 'Enviando...' : enviado ? '✅ Link enviado' : '🔑 Redefinir Senha'}
    </button>
  )
}
