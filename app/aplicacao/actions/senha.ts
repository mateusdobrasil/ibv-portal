'use server'

import { logAction } from '@/lib/audit'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function dispararRedefinicaoSenha(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const email = formData.get('email') as string
  const origin = formData.get('origin') as string

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/aplicacao/auth/callback?next=/aplicacao/redefinir-senha`,
  })

  // Se quem disparou já está logado, é um admin ajudando outra pessoa (Central de
  // Cadastro) — registra em auditoria. Se não há sessão, é autosserviço público
  // (tela de login) e não há nada pra logar.
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    await logAction(supabase, session.user, {
      action: 'SOLICITAÇÃO DE REDEFINIÇÃO DE SENHA',
      tableName: 'perfis',
      details: `Disparou um link de redefinição de senha para o e-mail ${email}.`,
    })
  }

  // Resposta sempre genérica: não revela se o e-mail existe no sistema.
  return { ok: true }
}
