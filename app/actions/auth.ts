'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function realizarLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createServerActionClient({ cookies })

  // 1. Tenta fazer o login no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error("❌ ERRO REAL DO SUPABASE:", authError.message)
    return { erro: 'E-mail ou senha incorretos. Tente novamente.' }
  }

  // 2. Busca o perfil do usuário para decidir o destino (O segredo está aqui!)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('tipo_usuario')
    .eq('id', authData.user.id)
    .single()

  const cargo = perfil?.tipo_usuario?.toLowerCase() || ''

  // 3. Redirecionamento Dinâmico
  // Se for admin, administrativo ou professor, vai para o HUB ADMIN
  if (cargo.includes('administrador') || cargo.includes('administrativo') || cargo.includes('professor')) {
    redirect('/dashboard/admin')
  } 
  
  // Caso contrário, vai para o painel de aluno
  redirect('/dashboard/aluno')
}