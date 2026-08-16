'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from "@/components/site/SiteHeader"
import Footer from "@/components/site/SiteFooter"

export default function RedefinirSenhaPage() {
  const supabase = createClientComponentClient()

  const [status, setStatus] = useState<'verificando' | 'pronto' | 'invalido' | 'concluido'>('verificando')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    // O Supabase troca o link de recuperação por uma sessão temporária assim que a
    // página carrega, disparando o evento PASSWORD_RECOVERY. Também checamos a
    // sessão diretamente como fallback, caso o evento já tenha disparado antes
    // deste listener ser registrado.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('pronto')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus((atual) => (atual === 'verificando' ? 'pronto' : atual))
      else setStatus((atual) => (atual === 'verificando' ? 'invalido' : atual))
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (senha !== confirmacao) {
      setErro('As senhas não conferem.')
      return
    }

    setCarregando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setCarregando(false)

    if (error) {
      setErro('Não foi possível atualizar a senha. Solicite um novo link e tente novamente.')
      return
    }

    setStatus('concluido')
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
            <h1 className="text-2xl font-black tracking-tight">Nova Senha</h1>
          </div>

          <div className="p-8">
            {status === 'verificando' && (
              <p className="text-center text-slate-500 text-sm">Verificando link...</p>
            )}

            {status === 'invalido' && (
              <div className="text-center space-y-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  Este link é inválido ou já expirou.
                </div>
                <Link href="/aplicacao/recuperar-senha" className="text-indigo-600 font-bold hover:underline text-sm">
                  Solicitar um novo link
                </Link>
              </div>
            )}

            {status === 'concluido' && (
              <div className="text-center space-y-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100">
                  Senha atualizada com sucesso!
                </div>
                <div className="flex flex-col gap-2 text-sm font-bold text-indigo-600">
                  <Link href="/aplicacao/ibv/login" className="hover:underline">Entrar no Portal IBV</Link>
                  <Link href="/aplicacao/ibuc/login" className="hover:underline">Entrar no Portal IBUC</Link>
                  <Link href="/aplicacao/ebd/login" className="hover:underline">Entrar no Portal EBD</Link>
                </div>
              </div>
            )}

            {status === 'pronto' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {erro && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 text-center">
                    {erro}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 p-3.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 p-3.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-md flex justify-center items-center gap-2"
                >
                  {carregando ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
