export const dynamic = 'force-dynamic'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CriadorMatricula from '../../../components/CriadorMatricula'
import BotaoStatusMatricula from '../../../components/BotaoStatusMatricula'
import MatriculaEmLote from '../../../components/MatriculaEmLote'

export default async function MatriculasPage() {
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

  // 4. Busca todas as matrículas para a tabela
  const { data: dadosMatriculas } = await supabase
    .from('matriculas')
    .select(`
      id,
      aluno_id,
      status,
      created_at,
      perfis ( nome_completo ),
      turmas ( nome, curso )
    `)
    .order('created_at', { ascending: false })

  // 5. Buscas para alimentar os botões de Nova Matrícula e Lote
  const { data: todasAsTurmas } = await supabase
    .from('turmas')
    .select('id, nome, curso')
    .eq('status', 'Ativa')
    .order('nome')

  const { data: todosOsAlunos } = await supabase
    .from('perfis')
    .select('id, nome_completo, cpf')
    .ilike('tipo_usuario', '%aluno%') // Busca flexível ignorando maiúsculas
    .order('nome_completo')

  const { data: cursosRegras } = await supabase
    .from('cursos')
    .select('nome, valor_mensalidade')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📄 Gestão de Matrículas</h1>
            <p className="text-gray-500 text-sm">Controle as inscrições e status dos alunos na instituição.</p>
          </div>
          <Link href="/dashboard/admin" className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition">
            Voltar
          </Link>
        </div>

        {/* BOTÕES DE MATRÍCULA */}
        <div className="mb-8 flex justify-end gap-2">
          <MatriculaEmLote 
            alunos={todosOsAlunos || []} 
            turmas={todasAsTurmas || []}
            cursosRegras={cursosRegras || []} 
          />
          <CriadorMatricula 
            alunos={todosOsAlunos || []} 
            turmas={todasAsTurmas || []}
            cursosRegras={cursosRegras || []} 
          />
        </div>

        {/* TABELA GERAL DE MATRÍCULAS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Aluno</th>
                  <th className="px-6 py-3 font-medium">Turma</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dadosMatriculas && dadosMatriculas.length > 0 ? (
                  dadosMatriculas.map((mat: any) => (
                    <tr key={mat.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(mat.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {mat.perfis?.nome_completo || 'Aluno Desconhecido'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="font-medium text-gray-800">{mat.turmas?.nome}</span>
                        <br />
                        <span className="text-xs">{mat.turmas?.curso}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider 
                          ${mat.status === 'Ativo' ? 'bg-blue-100 text-blue-700' : 
                            mat.status === 'Visitante' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                          {mat.status || 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {/* Botão Dinâmico para Trancar/Reativar */}
                        <BotaoStatusMatricula matriculaId={mat.id} statusAtual={mat.status || 'Ativo'} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      Nenhuma matrícula encontrada no sistema.
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