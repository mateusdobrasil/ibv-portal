'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Turma {
  id: string
  nome: string
  curso: string
}

interface Aluno {
  aluno_id: string
  nome_completo: string
  jaMatriculado: boolean
}

export default function MatriculaPorTurma({ 
  turmas, 
  turmaDestinoId 
}: { 
  turmas: Turma[], 
  turmaDestinoId: string 
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [isOpen, setIsOpen] = useState(false)
  const [turmaOrigemId, setTurmaOrigemId] = useState('')
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [buscaNome, setBuscaNome] = useState('') // 👈 Novo estado de pesquisa
  
  const [buscando, setBuscando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' })

  const fecharModal = () => {
    setIsOpen(false)
    setTurmaOrigemId('')
    setAlunos([])
    setSelecionados([])
    setBuscaNome('')
    setMensagem({ texto: '', tipo: '' })
  }

  useEffect(() => {
    async function buscarAlunos() {
      if (!turmaOrigemId) {
        setAlunos([])
        return
      }

      setBuscando(true)
      setMensagem({ texto: '', tipo: '' })
      
      try {
        let listaCrua: any[] = []

        // 1. Busca global ou busca por turma
        if (turmaOrigemId === 'todos') {
          // Puxa TODOS os alunos do Instituto
          const { data: todosAlunos, error: erroTodos } = await supabase
            .from('perfis')
            .select('id, nome_completo')
            .ilike('tipo_usuario', '%aluno%')

          if (erroTodos) throw erroTodos
          listaCrua = todosAlunos?.map(a => ({ aluno_id: a.id, nome_completo: a.nome_completo })) || []
        
        } else {
          // Puxa apenas alunos de uma turma específica
          const { data: matriculasOrigem, error: erroOrigem } = await supabase
            .from('matriculas')
            .select(`aluno_id, perfis ( nome_completo )`)
            .eq('turma_id', turmaOrigemId)

          if (erroOrigem) throw erroOrigem
          listaCrua = matriculasOrigem?.map((m: any) => ({ aluno_id: m.aluno_id, nome_completo: m.perfis?.nome_completo })) || []
        }

        // 2. Busca quem JÁ ESTÁ na Turma de Destino para bloquear a duplicata
        const { data: matriculasDestino, error: erroDestino } = await supabase
          .from('matriculas')
          .select('aluno_id')
          .eq('turma_id', turmaDestinoId)

        if (erroDestino) throw erroDestino

        const idsJaMatriculados = new Set(matriculasDestino?.map(m => m.aluno_id))

        // 3. Formata e organiza alfabeticamente
        const listaFormatada = listaCrua.map((a: any) => ({
          aluno_id: a.aluno_id,
          nome_completo: a.nome_completo || 'Aluno Desconhecido',
          jaMatriculado: idsJaMatriculados.has(a.aluno_id)
        })).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))

        setAlunos(listaFormatada)
        
        // 4. Auto-seleção inteligente
        if (turmaOrigemId === 'todos') {
          setSelecionados([]) // Se puxou o instituto inteiro, começa vazio por segurança
        } else {
          // Se puxou de uma turma, auto-seleciona quem ainda não está matriculado
          setSelecionados(listaFormatada.filter(a => !a.jaMatriculado).map(a => a.aluno_id))
        }

      } catch (error: any) {
        setMensagem({ texto: `Erro ao buscar alunos: ${error.message}`, tipo: 'erro' })
      } finally {
        setBuscando(false)
      }
    }

    buscarAlunos()
  }, [turmaOrigemId, turmaDestinoId, supabase])

  const alternarSelecao = (alunoId: string) => {
    setSelecionados(prev => 
      prev.includes(alunoId) 
        ? prev.filter(id => id !== alunoId) 
        : [...prev, alunoId]
    )
  }

  const salvarMatriculasLote = async () => {
    if (selecionados.length === 0) {
      setMensagem({ texto: 'Selecione pelo menos um aluno.', tipo: 'erro' })
      return
    }

    setSalvando(true)
    setMensagem({ texto: '', tipo: '' })

    try {
      const novasMatriculas = selecionados.map(alunoId => ({
        turma_id: turmaDestinoId,
        aluno_id: alunoId,
        status: 'Ativo',
        revista_entregue: false
      }))

      const { error } = await supabase.from('matriculas').insert(novasMatriculas)
      if (error) throw error

      setMensagem({ texto: `${selecionados.length} aluno(s) matriculado(s) com sucesso!`, tipo: 'sucesso' })
      
      setTimeout(() => {
        router.refresh()
        fecharModal()
      }, 1500)

    } catch (error: any) {
      setMensagem({ texto: `Erro ao matricular: ${error.message}`, tipo: 'erro' })
      setSalvando(false)
    }
  }

  // Filtra as turmas e a lista de alunos pela pesquisa de texto
  const turmasDisponiveis = turmas.filter(t => t.id !== turmaDestinoId)
  const alunosFiltrados = alunos.filter(a => a.nome_completo.toLowerCase().includes(buscaNome.toLowerCase()))

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 hover:border-indigo-300 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
      >
        👥 Matrícula Rápida (Em Lote)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">👥 Matricular Alunos</h2>
                <p className="text-sm text-gray-400 mt-1">Busque alunos globalmente ou copie de uma turma.</p>
              </div>
              <button onClick={fecharModal} className="text-gray-400 hover:text-white bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {mensagem.texto && (
                <div className={`p-3 rounded-lg text-sm font-bold ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {mensagem.texto}
                </div>
              )}

              {/* SELEÇÃO DE ORIGEM */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Origem dos Alunos</label>
                <select 
                  value={turmaOrigemId} 
                  onChange={(e) => setTurmaOrigemId(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 bg-gray-50"
                >
                  <option value="">-- Escolha uma fonte --</option>
                  <option value="todos" className="font-bold text-indigo-700">🌟 Mostrar TODOS OS ALUNOS do Instituto</option>
                  <optgroup label="Ou copie de uma Turma Específica:">
                    {turmasDisponiveis.map(t => (
                      <option key={t.id} value={t.id}>{t.nome} ({t.curso || 'Sem Curso'})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* LISTA DE ALUNOS COM BARRA DE PESQUISA */}
              {turmaOrigemId && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  
                  {/* BARRA DE FERRAMENTAS DA LISTA */}
                  <div className="bg-gray-50 p-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="🔍 Buscar aluno por nome..." 
                      value={buscaNome}
                      onChange={(e) => setBuscaNome(e.target.value)}
                      className="w-full sm:w-64 border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full whitespace-nowrap">
                      {selecionados.length} marcado(s)
                    </span>
                  </div>

                  {/* CAIXA DE ROLAGEM DOS ALUNOS */}
                  <div className="max-h-64 overflow-y-auto p-2 bg-white space-y-1">
                    {buscando ? (
                      <div className="p-8 text-center text-gray-400 font-medium animate-pulse">Carregando alunos...</div>
                    ) : alunosFiltrados.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 font-medium">Nenhum aluno encontrado para exibir.</div>
                    ) : (
                      alunosFiltrados.map(aluno => (
                        <label 
                          key={aluno.aluno_id} 
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${aluno.jaMatriculado ? 'bg-gray-50 opacity-60' : 'hover:bg-indigo-50 border border-transparent hover:border-indigo-100'}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={selecionados.includes(aluno.aluno_id)}
                            onChange={() => alternarSelecao(aluno.aluno_id)}
                            disabled={aluno.jaMatriculado || salvando}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="font-bold text-gray-800 text-sm block">{aluno.nome_completo}</span>
                            {aluno.jaMatriculado && (
                              <span className="text-[10px] font-bold text-orange-600 uppercase">Já matriculado nesta classe</span>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={fecharModal} 
                disabled={salvando}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarMatriculasLote}
                disabled={salvando || selecionados.length === 0}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm flex items-center gap-2"
              >
                {salvando ? 'Processando...' : `Concluir Matrícula`}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}