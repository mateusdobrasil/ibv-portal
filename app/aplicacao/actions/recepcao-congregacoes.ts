'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { exigirAdminRecepcao } from './recepcao-guard'
import { registrarLogRecepcao } from './recepcao-log'

export async function listarCongregacoes() {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase
    .from('recepcao_congregacoes')
    .select('*')
    .order('nome_congregacao')

  if (error) throw new Error(`Erro ao listar congregações: ${error.message}`)
  return data
}

export async function criarCongregacao(formData: FormData) {
  await exigirAdminRecepcao()

  const nome  = (formData.get('nome') as string)?.trim()
  const senha = (formData.get('senha') as string)?.trim()

  if (!nome || !senha) throw new Error('Informe o nome da congregação e a senha de acesso.')
  if (nome.toLowerCase() === 'admin') throw new Error('O nome "Admin" é reservado para o acesso administrativo.')

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_congregacoes')
    .insert({ nome_congregacao: nome, senha })

  if (error) {
    if (error.code === '23505') throw new Error('Já existe uma congregação cadastrada com esse nome.')
    throw new Error(`Erro ao criar congregação: ${error.message}`)
  }

  await registrarLogRecepcao('Admin', 'criar_congregacao', `Cadastrou a congregação "${nome}".`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function atualizarSenhaCongregacao(id: string, novaSenha: string, nome?: string) {
  await exigirAdminRecepcao()

  const senha = novaSenha?.trim()
  if (!senha) throw new Error('Informe a nova senha.')

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_congregacoes')
    .update({ senha })
    .eq('id', id)

  if (error) throw new Error(`Erro ao atualizar senha: ${error.message}`)

  await registrarLogRecepcao('Admin', 'alterar_senha_congregacao', `Alterou a senha da congregação "${nome || id}".`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function alternarAtivoCongregacao(id: string, ativoAtual: boolean, nome?: string) {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_congregacoes')
    .update({ ativo: !ativoAtual })
    .eq('id', id)

  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)

  await registrarLogRecepcao(
    'Admin',
    ativoAtual ? 'desativar_congregacao' : 'ativar_congregacao',
    `${ativoAtual ? 'Desativou' : 'Ativou'} a congregação "${nome || id}".`
  )
  revalidatePath('/aplicacao/recepcao/congregacoes')
}

export async function excluirCongregacao(id: string, nome?: string) {
  await exigirAdminRecepcao()

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase
    .from('recepcao_congregacoes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Erro ao excluir congregação: ${error.message}`)

  await registrarLogRecepcao('Admin', 'excluir_congregacao', `Excluiu a congregação "${nome || id}".`)
  revalidatePath('/aplicacao/recepcao/congregacoes')
}
