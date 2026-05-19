'use client'

import { useState } from 'react'
import { matricularEmLote } from '../actions/matriculas'

interface MatriculaEmLoteProps {
  alunos: any[]
  turmas: any[]
  cursosRegras: any[]
}

export default function MatriculaEmLote({ alunos, turmas, cursosRegras = [] }: MatriculaEmLoteProps) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [valorMensalidade, setValorMensalidade] = useState<number>(0)
  
  // Estado para o campo de busca de alunos
  const [buscaAluno, setBuscaAluno] = useState('')

  const atualizarValorAutomatico = (turmaId: string) => {
    const turmaSelecionada = turmas.find(t => t.id === turmaId)
    if (turmaSelecionada) {
      const cursoEncontrado = cursosRegras.find(c => c.nome === turmaSelecionada.curso)
      if (cursoEncontrado) {
        setValorMensalidade(cursoEncontrado.valor_mensalidade || 0)
        return
      }
    }
    setValorMensalidade(0)
  }

  // Filtra os alunos baseado no que foi digitado
  const alunosFiltrados = alunos.filter(a => 
    a.nome_completo.toLowerCase().includes(buscaAluno.toLowerCase())
  )

  if (!aberto) {
    return (
      <button 
        onClick={() => setAberto(true)} 
        className="bg-slate-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-900 transition shadow-sm"
      >
        📑 Matrícula em Lote
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col text-left">
        
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Matrícula em Lote (Múltiplos Alunos)</h3>
          <p className="text-sm text-gray-500">Selecione a turma e marque os alunos que deseja matricular.</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {erro}
            </div>
          )}

          <form id="form-lote" action={async (formData) => {
            setCarregando(true)
            setErro('')
            try {
              await matricularEmLote(formData)
              setAberto(false)
            } catch (e: any) {
              setErro(e.message)
            } finally {
              setCarregando(false)
            }
          }} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LADO ESQUERDO: SELEÇÃO DA TURMA E FINANCEIRO */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider">1. Turma e Regras</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Turma Destino</label>
                  <select name="turma_id" required onChange={(e) => atualizarValorAutomatico(e.target.value)} className="w-full border p-2.5 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500">
                    <option value="">Escolha uma turma...</option>
                    {turmas?.map(t => (
                      <option key={t.id} value={t.id}>{t.nome} — {t.curso}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxa Matrícula</label>
                    <input type="number" step="0.01" name="valor_matricula" defaultValue="0" className="w-full border p-2.5 rounded-lg text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensalidade</label>
                    <input type="number" name="valor_mensalidade" value={valorMensalidade} readOnly required className="w-full border p-2.5 rounded-lg bg-gray-50 text-gray-500 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meses</label>
                    <input type="number" name="quantidade_parcelas" min="1" required className="w-full border p-2.5 rounded-lg text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">1º Vencimento</label>
                    <input type="date" name="data_primeiro_vencimento" required className="w-full border p-2.5 rounded-lg text-gray-900 bg-white" />
                  </div>
                </div>
              </div>

              {/* LADO DIREITO: LISTA DE ALUNOS COM CHECKBOX */}
              <div className="space-y-4 flex flex-col h-full">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider">2. Selecione os Alunos</h4>
                
                <input 
                  type="text" 
                  placeholder="Pesquisar aluno pelo nome..." 
                  value={buscaAluno}
                  onChange={(e) => setBuscaAluno(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm text-gray-900"
                />

                <div className="border border-gray-200 rounded-lg bg-white overflow-y-auto max-h-[250px] flex-1">
                  {alunosFiltrados.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">Nenhum aluno encontrado.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {alunosFiltrados.map(aluno => (
                        <label key={aluno.id} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition">
                          <input 
                            type="checkbox" 
                            name="alunos_selecionados" 
                            value={aluno.id} 
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-800">{aluno.nome_completo}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl">
          <button type="button" onClick={() => setAberto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition">
            Cancelar
          </button>
          {/* O botão 'form' aponta para o ID do formulário acima */}
          <button form="form-lote" type="submit" disabled={carregando} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition">
            {carregando ? 'Processando Lote...' : 'Matricular Selecionados'}
          </button>
        </div>

      </div>
    </div>
  )
}