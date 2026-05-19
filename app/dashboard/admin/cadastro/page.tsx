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

  // 3. TRAVA DE SEGURANÇA: Administrador, Administrativo e Professor
  const tipo = perfil?.tipo_usuario?.toLowerCase() || ''
  const temAcesso = tipo.includes('administrador') || 
                    tipo.includes('administrativo') || 
                    tipo.includes('professor')

  if (!temAcesso) {
    redirect('/dashboard') // Se não tiver permissão, redireciona para fora do admin
  }

  // 4. BUSCA TODO MUNDO (Sem filtro, para gerenciar Equipe e Alunos)
  const { data: usuarios } = await supabase
    .from('perfis')
    .select('*')
    .order('nome_completo')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👥 Cadastro Central</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie todos os usuários do sistema (Alunos e Equipe).</p>
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
                  <th className="px-6 py-3 font-medium">Cargos / Acesso</th>
                  <th className="px-6 py-3 font-medium">E-mail</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios && usuarios.length > 0 ? (
                  usuarios.map((user) => {
                    // Pega os cargos e transforma em um array para as etiquetas
                    const cargos = user.tipo_usuario ? user.tipo_usuario.split(',') : ['aluno']
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-800">{user.nome_completo}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {cargos.map((cargo: string) => (
                              <span 
                                key={cargo} 
                                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                                  ${cargo.trim().toLowerCase() === 'administrador' ? 'bg-red-100 text-red-700' : 
                                    cargo.trim().toLowerCase() === 'professor' ? 'bg-orange-100 text-orange-700' : 
                                    'bg-blue-100 text-blue-700'}`}
                              >
                                {cargo.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/dashboard/admin/cadastro/${user.id}`} 
                            className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm inline-block"
                          >
                            Ver perfil
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                      Nenhum usuário encontrado.
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