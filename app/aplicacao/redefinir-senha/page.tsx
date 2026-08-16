'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from "@/components/site/SiteHeader"
import Footer from "@/components/site/SiteFooter"

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaConteudo />
    </Suspense>
  )
}

function RedefinirSenhaConteudo() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'verificando' | 'pronto' | 'invalido' | 'concluido'>('verificando')
  const [motivoInvalido, setMotivoInvalido] = useState('Este link é inválido ou já expirou.')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    let cancelado = false
    let unsubscribe: (() => void) | undefined

    async function verificar() {
      // O Supabase pode devolver o erro (link expirado / já usado) tanto na query
      // string quanto no hash da URL, dependendo do fluxo.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const descricaoErro = searchParams.get('error_description') || hashParams.get('error_description')
      if (descricaoErro) {
        if (!cancelado) {
          setMotivoInvalido(
            descricaoErro.includes('expired')
              ? 'Este link expirou ou já foi usado. Isso também acontece quando o seu provedor de e-mail "pré-visita" o link automaticamente antes de você clicar — se for o caso, tente copiar e colar o link direto no navegador na próxima vez.'
              : decodeURIComponent(descricaoErro.replace(/\+/g, ' '))
          )
          setStatus('invalido')
        }
        return
      }

      // Fluxo PKCE: o link chega com ?code=... e precisa ser trocado por sessão.
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelado) setStatus(error ? 'invalido' : 'pronto')
        return
      }

      // Fluxo implícito (mais antigo): o Supabase já injeta a sessão a partir do
      // hash da URL e dispara PASSWORD_RECOVERY. Como o evento pode disparar antes
      // deste listener existir, também checamos getSession() como fallback.
      const { data: listener } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' && !cancelado) setStatus('pronto')
      })
      unsubscribe = () => listener.subscription.unsubscribe()

      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelado) {
        setStatus((atual) => (atual === 'verificando' ? (session ? 'pronto' : 'invalido') : atual))
      }
    }

    verificar()
    return () => { cancelado = true; unsubscribe?.() }
  }, [supabase, searchParams])

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
      if (error.code === 'same_password' || error.message.toLowerCase().includes('different from the old password')) {
        setErro('A nova senha precisa ser diferente da senha atual.')
      } else if (error.code === 'weak_password' || error.message.toLowerCase().includes('weak')) {
        setErro('Essa senha é fraca demais. Tente uma combinação mais forte.')
      } else if (error.status === 401 || error.code === 'session_not_found') {
        setErro('Sua sessão de recuperação expirou. Solicite um novo link e tente novamente.')
      } else {
        setErro(`Não foi possível atualizar a senha: ${error.message}`)
      }
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
                  {motivoInvalido}
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
