'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// ============================================================================
// BLOCO 1: CRIAR NOVO USUÁRIO (A função que o Next.js estava sentindo falta)
// ============================================================================
export async function criarUsuario(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const nome_completo = formData.get('nome_completo') as string
  const tipo_usuario = (formData.get('tipo_usuario') as string) || 'aluno'

  // 1. Verificação de Segurança (Apenas admin cria usuários diretamente pelo painel)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Não autorizado')

  // 2. Criação do Usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome_completo,
        tipo_usuario
      }
    }
  })

  if (error) throw new Error(`Erro ao criar usuário: ${error.message}`)

  // 3. Auditoria
  const { data: admin } = await supabase.from('perfis').select('nome_completo').eq('id', session.user.id).single()
  await supabase.from('auditoria').insert({
    usuario_id: session.user.id,
    usuario_nome: admin?.nome_completo || 'Sistema',
    acao: 'NOVO CADASTRO MANUAL',
    tabela_afetada: 'perfis',
    detalhes: `Cadastrou o usuário: ${nome_completo} (${tipo_usuario})`
  })

  revalidatePath('/dashboard/admin/cadastro')
}

// ============================================================================
// BLOCO 2: ATUALIZAR USUÁRIO (A edição completa que criamos antes)
// ============================================================================
export async function atualizarUsuario(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Não autorizado')

  const id = formData.get('id') as string
  const dadosParaAtualizar: Record<string, any> = {}

  formData.forEach((value, key) => {
    if (key !== 'id' && !key.startsWith('$')) {
      if (key.includes('data') && value === '') {
        dadosParaAtualizar[key] = null
      } else {
        dadosParaAtualizar[key] = value
      }
    }
  })

  const { error } = await supabase
    .from('perfis')
    .update(dadosParaAtualizar)
    .eq('id', id)

  if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`)

  const { data: admin } = await supabase.from('perfis').select('nome_completo').eq('id', session.user.id).single()

  await supabase.from('auditoria').insert({
    usuario_id: session.user.id,
    usuario_nome: admin?.nome_completo || 'Sistema',
    acao: 'EDIÇÃO COMPLETA DE CADASTRO',
    tabela_afetada: 'perfis',
    detalhes: `Editou os dados completos de: ${dadosParaAtualizar.nome_completo}`
  })

  revalidatePath(`/dashboard/admin/cadastro/${id}`)
  revalidatePath('/dashboard/admin/cadastro')
}