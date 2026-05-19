export const dynamic = 'force-dynamic'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CriadorUsuario from '../../../components/CriadorUsuario'

export default async function CadastroCentralPage() {
  const supabase = createServerComponentClient({ cookies })

  // 1. Verificação de Sessão
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/')

  // 2. Busca o perfil do usuário logado para checar acesso
  const { data: perfil } = await supabase
    .from('perfis')
    .select('tipo_usuario')
    .eq('id', session.user.id)
    .single()

  // 3. TRAVA DE SEGURANÇA: Administrador, Administrativo e Professor têm acesso.
  // Convertendo para minúsculas para evitar erros de digitação no banco (ex: 'Professor' vs 'professor')
  const tipo = perfil?.tipo_usuario?.toLowerCase() || ''
  const temAcesso = tipo.includes('administrador') || 
                    tipo.includes('administrativo') || 
                    tipo.includes('professor')

  if (!temAcesso) {
    redirect('/dashboard') // Se for Aluno ou visitante, expulsa da página
  }

  // 4. Busca todos os usuários que têm 'aluno' no tipo_usuario
  const { data: alunos } = await supabase
    .from('perfis')
    .select('*')
    .ilike('tipo_usuario', '%aluno%') 
    .order('nome_completo')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👥 Cadastro Central de Alunos</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie todos os estudantes matriculados.</p>
          </div>
          <Link href="/dashboard/admin" className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
            Voltar ao Hub
          </Link>
        </div>

        <div className="mb-8 flex justify-end">
          <CriadorUsuario />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome Completo</th>
                  <th className="px-6 py-3 font-medium">E-mail</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alunos && alunos.length > 0 ? (
                  alunos.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-800">{aluno.nome_completo}</td>
                      <td className="px-6 py-4 text-gray-500">{aluno.email}</td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/dashboard/admin/alunos/${aluno.id}`} 
                          className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-indigo-100 transition"
                        >
                          Ver Perfil
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}