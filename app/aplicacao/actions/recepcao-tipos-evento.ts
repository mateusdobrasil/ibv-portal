'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { exigirAdminRecepcao } from './recepcao-guard'
import { registrarLogRecepcao } from './recepcao-log'

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

  await registrarLogRecepcao('Admin', 'criar_tipo_evento', `Cadastrou o tipo de culto "${nome}".`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function alternarAtivoTipoEvento(id: string, ativoAtual: boolean, nome?: string) {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_tipos_evento')
    .update({ ativo: !ativoAtual })
    .eq('id', id)

  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)

  await registrarLogRecepcao(
    'Admin',
    ativoAtual ? 'desativar_tipo_evento' : 'ativar_tipo_evento',
    `${ativoAtual ? 'Desativou' : 'Ativou'} o tipo de culto "${nome || id}".`
  )
  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function excluirTipoEvento(id: string, nome?: string) {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_tipos_evento')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Erro ao excluir tipo de culto: ${error.message}`)

  await registrarLogRecepcao('Admin', 'excluir_tipo_evento', `Excluiu o tipo de culto "${nome || id}".`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}
