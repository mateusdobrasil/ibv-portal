'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { exigirAdminRecepcao } from './recepcao-guard'

export async function listarTiposEvento() {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase
    .from('recepcao_tipos_evento')
    .select('*')
    .order('nome')

  if (error) throw new Error(`Erro ao listar tipos de culto: ${error.message}`)
  return data
}

export async function criarTipoEvento(formData: FormData) {
  await exigirAdminRecepcao()

  const nome = (formData.get('nome') as string)?.trim()
  if (!nome) throw new Error('Informe o nome do tipo de culto.')

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_tipos_evento')
    .insert({ nome })

  if (error) {
    if (error.code === '23505') throw new Error('Já existe um tipo de culto cadastrado com esse nome.')
    throw new Error(`Erro ao criar tipo de culto: ${error.message}`)
  }

  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function alternarAtivoTipoEvento(id: string, ativoAtual: boolean) {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_tipos_evento')
    .update({ ativo: !ativoAtual })
    .eq('id', id)

  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function excluirTipoEvento(id: string) {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_tipos_evento')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Erro ao excluir tipo de culto: ${error.message}`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}
