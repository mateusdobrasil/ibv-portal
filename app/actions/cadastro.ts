'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Função auxiliar para lidar com datas vazias do formulário
const limparData = (dataStr: FormDataEntryValue | null) => {
  if (!dataStr || typeof dataStr !== 'string' || dataStr.trim() === '') return null
  return dataStr
}

export async function cadastrarAluno(formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const nome = formData.get('nome') as string

  const supabase = createServerActionClient({ cookies })

  // 1. Cria o usuário no Autenticador do Supabase (A porta de entrada)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha,
  })

  // Se der erro de email já existente ou senha fraca
  if (authError) {
    throw new Error(`Erro na criação da conta: ${authError.message}`)
  }

  const userId = authData.user?.id
  if (!userId) {
    throw new Error('Falha ao obter o ID do usuário após o cadastro.')
  }

  // 2. Salva TODOS os detalhes na tabela perfis (UPSERT)
  const { error: perfilError } = await supabase
    .from('perfis')
    .upsert({
      id: userId,
      tipo_usuario: 'aluno', // Todo mundo que se cadastra por aqui é aluno por padrão
      polo: 'Sede Vinhedo',  // Você pode ajustar o polo padrão depois
      email: email,
      nome_completo: nome,
      celular: formData.get('celular'),
      data_nascimento: limparData(formData.get('data_nascimento')),
      sexo: formData.get('sexo'),
      estado_civil: formData.get('estado_civil'),
      cpf: formData.get('cpf'),
      rg: formData.get('rg'),
      nacionalidade: formData.get('nacionalidade'),
      cidade_nascimento: formData.get('cidade_nascimento'),
      estado_nascimento: formData.get('estado_nascimento'),
      profissao: formData.get('profissao'),
      
      endereco: formData.get('endereco'),
      complemento: formData.get('complemento'),
      bairro: formData.get('bairro'),
      cidade: formData.get('cidade'),
      cep: formData.get('cep'),
      
      escolaridade: formData.get('escolaridade'),
      qual_curso: formData.get('qual_curso'),
      possui_teologia: formData.get('possui_teologia'),
      qual_teologia: formData.get('qual_teologia'),
      onde_teologia: formData.get('onde_teologia'),
      
      igreja: formData.get('igreja'),
      local_igreja: formData.get('local_igreja'),
      pastor: formData.get('pastor'),
      departamento: formData.get('departamento'),
      possui_cargo: formData.get('possui_cargo'),
      qual_cargo: formData.get('qual_cargo'),
      data_conversao: limparData(formData.get('data_conversao')),
      data_batismo: limparData(formData.get('data_batismo')),
    })

  if (perfilError) {
    console.error("Erro ao salvar detalhes do perfil:", perfilError)
    throw new Error('Conta criada, mas houve um erro ao salvar os detalhes. Contate a secretaria.')
  }

  if (perfilError) {
    console.error("Erro ao salvar detalhes do perfil:", perfilError)
    throw new Error('Conta criada, mas houve um erro ao salvar os detalhes. Contate a secretaria.')
  }

  // 👇 O ESPIÃO DA AUDITORIA (Novo Cadastro) 👇
  const { error: auditError } = await supabase.from('auditoria').insert({
    usuario_id: userId, // O ID do novo aluno
    usuario_nome: nome, // O nome do novo aluno
    acao: 'NOVO CADASTRO',
    tabela_afetada: 'perfis',
    detalhes: `O aluno ${nome} realizou o auto-cadastro pelo portal público.`
  })

  if (auditError) console.error("❌ ERRO AO GRAVAR AUDITORIA:", auditError.message)
  // 👆 FIM DO ESPIÃO 👆

  // 3. Se tudo der certo, redireciona o aluno direto para o login
  redirect('/login')
}