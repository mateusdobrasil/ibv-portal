'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { exigirAdminRecepcao } from './recepcao-guard'

// Leitura do log usa a service role (contorna o RLS no servidor) porque a
// tabela recepcao_log só permite INSERT para o público — nunca SELECT — e
// quem pode chamar listarLogRecepcao já é validado por exigirAdminRecepcao().
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function registrarLogRecepcao(congregacao: string, acao: string, detalhes?: string, usuario?: string | null) {
  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_log')
    .insert({ congregacao, acao, detalhes: detalhes || null, usuario: usuario || null })

  if (error) console.error('Falha ao gravar log de Recepção:', error.message)
}

export async function listarLogRecepcao() {
  await exigirAdminRecepcao()

  const { data, error } = await supabaseAdmin()
    .from('recepcao_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) throw new Error(`Erro ao listar log: ${error.message}`)
  return data
}
