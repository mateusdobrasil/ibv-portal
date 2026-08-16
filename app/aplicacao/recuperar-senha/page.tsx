'use client'

import { useState } from 'react'
import Link from 'next/link'
import { dispararRedefinicaoSenha } from '../actions/senha'
import Header from "@/components/site/SiteHeader"
import Footer from "@/components/site/SiteFooter"

export default function RecuperarSenhaPage() {
  const [carregando, setCarregando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCarregando(true)

    const formData = new FormData(e.currentTarget)
    formData.set('origin', window.location.origin)

    await dispararRedefinicaoSenha(formData)
    setCarregando(false)
    setEnviado(true)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

          <div className="bg-indigo-600 p-8 text-center text-white">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              🔑
            </div>
            <h1 className="text-2xl font-black tracking-tight">Recuperar Acesso</h1>
            <p className="text-indigo-100 text-sm mt-1 font-medium">Informe seu e-mail de cadastro</p>
          </div>

          <div className="p-8">
            {enviado ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100">
                  Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha. Confira sua caixa de entrada (e o spam).
                </div>
                <Link href="/aplicacao/login" className="text-indigo-600 font-bold hover:underline text-sm">
                  ← Voltar para o login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full border border-slate-200 p-3.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-md flex justify-center items-center gap-2"
                >
                  {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>

                <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
                  <Link href="/aplicacao/login" className="text-indigo-600 font-bold hover:underline">
                    ← Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
