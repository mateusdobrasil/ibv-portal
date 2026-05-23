import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { toggleStatusApresentacao, deletarCadastro } from '../actions/actions'
import logo from '../../imgs/logo.png' 

export const dynamic = 'force-dynamic' 

export default async function EdicaoCadastros() {
  const supabase = createServerComponentClient({ cookies })

  // Busca todos os campos de todas as tabelas (incluindo esposa e representante)
  const { data: visitantes, error } = await supabase
    .from('visitantes')
    .select(`
      id, 
      nome_visitante, 
      setor_trabalho, 
      nome_esposa, 
      representado_por, 
      foi_apresentado, 
      created_at,
      dependentes_acompanhantes ( nome, tipo )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-10 text-red-500">Erro ao carregar dados: {error.message}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho com Logo e Botões */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img src={logo.src} alt="Logo AD Vinhedo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestão de Cadastros</h1>
              <p className="text-gray-500 mt-1">Painel AD Vinhedo • Histórico e Edição Completa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <form action={async () => {
              "use server";
              revalidatePath('/apresentacao/edicao');
            }}>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
            </form>

            <Link href="/apresentacao" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition shadow-sm">
              Voltar ao Menu
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* Tabela expandida para caber todas as informações */}
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold whitespace-nowrap">Data / Hora</th>
                  <th className="p-4 font-semibold">Visitante & Setor</th>
                  <th className="p-4 font-semibold">Representado Por</th>
                  <th className="p-4 font-semibold">Esposa</th>
                  <th className="p-4 font-semibold">Filhos / Acompanhantes</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {visitantes?.map((visitante) => {
                  
                  // Separando os dados para exibição
                  const filhos = visitante.dependentes_acompanhantes?.filter((d: any) => d.tipo === 'FILHO') || [];
                  const acompanhantes = visitante.dependentes_acompanhantes?.filter((d: any) => d.tipo === 'ACOMPANHANTE') || [];
                  
                  // Formatando a data
                  const dataCriacao = new Date(visitante.created_at);
                  const dataFormatada = dataCriacao.toLocaleDateString('pt-BR');
                  const horaFormatada = dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={visitante.id} className="hover:bg-gray-50 transition-colors">
                      
                      {/* Coluna 1: Data */}
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        <div className="font-medium text-gray-700">{dataFormatada}</div>
                        <div className="text-xs">{horaFormatada}</div>
                      </td>

                      {/* Coluna 2: Visitante e Setor */}
                      <td className="p-4">
                        <div className="font-bold text-gray-900 uppercase">{visitante.nome_visitante}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {visitante.setor_trabalho ? `De: ${visitante.setor_trabalho}` : <span className="italic">Sem setor</span>}
                        </div>
                      </td>

                      {/* Coluna 3: Representante */}
                      <td className="p-4">
                        {visitante.representado_por ? (
                          <span className="bg-yellow-100 text-yellow-800 py-1 px-2 rounded font-medium text-xs">
                            {visitante.representado_por}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      {/* Coluna 4: Esposa */}
                      <td className="p-4 text-gray-700 font-medium">
                        {visitante.nome_esposa || <span className="text-gray-400 italic font-normal">-</span>}
                      </td>
                      
                      {/* Coluna 5: Filhos e Acompanhantes */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {filhos.length > 0 && (
                            <div className="text-xs">
                              <span className="font-bold text-gray-600">Filhos:</span> {filhos.map((f: any) => f.nome).join(', ')}
                            </div>
                          )}
                          {acompanhantes.length > 0 && (
                            <div className="text-xs">
                              <span className="font-bold text-gray-600">Acomp:</span> {acompanhantes.map((a: any) => a.nome).join(', ')}
                            </div>
                          )}
                          {filhos.length === 0 && acompanhantes.length === 0 && (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </div>
                      </td>

                      {/* Coluna 6: Status */}
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          visitante.foi_apresentado 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {visitante.foi_apresentado ? 'Apresentado' : 'Na Fila'}
                        </span>
                      </td>

                      {/* Coluna 7: Ações */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        
                        {/* Botão Apresentar/Desfazer */}
                        <form 
                          className="inline-block"
                          action={async () => {
                            "use server";
                            await toggleStatusApresentacao(visitante.id, visitante.foi_apresentado);
                          }}
                        >
                          <button type="submit" className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition font-medium">
                            {visitante.foi_apresentado ? 'Desfazer' : 'Apresentar'}
                          </button>
                        </form>

                        {/* Botão Editar (Novo) */}
                        <Link 
                          href={`/apresentacao/edicao/${visitante.id}`}
                          className="inline-block text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition font-medium"
                        >
                          Editar
                        </Link>
                        
                        {/* Botão Excluir */}
                        <form 
                          className="inline-block"
                          action={async () => {
                            "use server";
                            await deletarCadastro(visitante.id);
                          }}
                        >
                          <button type="submit" className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition font-medium">
                            Excluir
                          </button>
                        </form>

                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {visitantes?.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhum cadastro encontrado no banco de dados.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}