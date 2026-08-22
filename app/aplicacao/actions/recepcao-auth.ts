'use server'

import { cookies } from 'next/headers'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

const COOKIE_NAME       = 'recepcao_auth'
const COOKIE_CONGREGACAO = 'recepcao_congregacao'
const MAX_AGE           = 60 * 60 * 8  // 8 horas

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

  return { ok: true }
}

export async function logoutRecepcao(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  cookieStore.delete(COOKIE_CONGREGACAO)
}

export async function verificarAuthRecepcao(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === 'true'
}
