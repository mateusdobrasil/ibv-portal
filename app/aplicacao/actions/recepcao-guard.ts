import { cookies } from 'next/headers'

export async function exigirAdminRecepcao() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('recepcao_auth')?.value
  const congregacao = cookieStore.get('recepcao_congregacao')?.value

  if (auth !== 'true' || congregacao !== 'Admin') {
    throw new Error('Acesso restrito ao administrador.')
  }
}
