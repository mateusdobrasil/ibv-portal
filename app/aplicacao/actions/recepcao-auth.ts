'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { registrarLogRecepcao } from './recepcao-log'

const COOKIE_NAME        = 'recepcao_auth'
const COOKIE_CONGREGACAO = 'recepcao_congregacao'
const COOKIE_USUARIO     = 'recepcao_usuario'
const MAX_AGE            = 60 * 60 * 8  // 8 horas

export async function loginRecepcao(senha: string): Promise<{ ok: boolean }> {
  const senhaAdmin = process.env.RECEPCAO_PASSWORD
  let congregacao: string | null = null

  if (senhaAdmin && senha === senhaAdmin) {
    congregacao = 'Admin'
  } else {
    const supabase = createServerActionClient({ cookies })
    const { data } = await supabase
      .from('recepcao_congregacoes')
      .select('nome_congregacao')
      .eq('senha', senha)
      .eq('ativo', true)
      .maybeSingle()

    if (data) congregacao = data.nome_congregacao
  }

  if (!congregacao) return { ok: false }

  const cookieStore = await cookies()
  const opcoesBase = {
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge:   MAX_AGE,
    path:     '/aplicacao/recepcao',
  }

  cookieStore.set(COOKIE_NAME, 'true', { ...opcoesBase, httpOnly: true })
  cookieStore.set(COOKIE_CONGREGACAO, congregacao, { ...opcoesBase, httpOnly: false })

  // Congregações precisam se identificar (tela seguinte) antes do login entrar
  // no log — só ali sabemos o nome de quem está acessando. O Admin não passa
  // por essa etapa, então já registramos o acesso dele aqui mesmo.
  //
  // O redirect acontece AQUI DENTRO (em vez de devolver { ok } e deixar o
  // cliente chamar router.push) de propósito: assim os cookies acima já vão
  // garantidos na mesma resposta que leva à próxima página, sem a corrida em
  // que o middleware lia o cookie antigo e mandava de volta pro login/tela
  // errada até a pessoa dar refresh manual algumas vezes.
  if (congregacao === 'Admin') {
    await registrarLogRecepcao(congregacao, 'login')
    redirect('/aplicacao/recepcao')
  }

  redirect('/aplicacao/recepcao/identificacao')
}

export async function confirmarIdentificacaoRecepcao(nome: string): Promise<{ ok: boolean }> {
  const nomeLimpo = nome?.trim()
  if (!nomeLimpo) return { ok: false }

  const cookieStore = await cookies()
  const autenticado  = cookieStore.get(COOKIE_NAME)?.value === 'true'
  const congregacao  = cookieStore.get(COOKIE_CONGREGACAO)?.value

  if (!autenticado || !congregacao) return { ok: false }

  cookieStore.set(COOKIE_USUARIO, nomeLimpo, {
    httpOnly: false,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   MAX_AGE,
    path:     '/aplicacao/recepcao',
  })

  await registrarLogRecepcao(congregacao, 'login', undefined, nomeLimpo)

  redirect('/aplicacao/recepcao')
}

export async function logoutRecepcao(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  cookieStore.delete(COOKIE_CONGREGACAO)
  cookieStore.delete(COOKIE_USUARIO)
}

export async function verificarAuthRecepcao(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === 'true'
}
