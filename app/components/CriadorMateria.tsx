'use client'

import { useState } from 'react'
import { salvarMateria } from '../actions/materias'

interface CriadorMateriaProps {
  materia?: any // Se vier preenchido, o componente entra no modo de Edição
  cursos: any[] // Lista de cursos (apenas os ativos) para preencher a caixa de seleção
}

export default function CriadorMateria({ materia, cursos }: CriadorMateriaProps) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleAcao(formData: FormData) {
    setCarregando(true)
    try {
      await salvarMateria(formData)
      setAberto(false) // Fecha o modal se o salvamento for um sucesso
    } catch (err: any) {
      alert(err.message) // Exibe o erro caso algo falhe no banco ou na Action
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      {/* BOTÃO DE GATILHO: Muda o visual automaticamente se for botão de editar ou de criar novo */}
      <button 
        onClick={() => setAberto(true)} 
        className={materia 
          ? "text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition" 
          : "w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition"
        }
      >
        {materia ? 'Editar' : '+ Cadastrar Nova Matéria'}
      </button>

      {/* MODAL / JANELA FLUTUANTE */}
      {aberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            
            {/* Cabeçalho do Modal */}
            <div className="bg-blue-900 p-6 text-white">
              <h2 className="text-xl font-bold">{materia ? 'Editar Matéria' : 'Nova Matéria'}</h2>
            </div>
            
            {/* Formulário */}
            <form action={handleAcao} className="p-6 space-y-4">
              
              {/* O campo ID escondido garante que o sistema saiba qual matéria atualizar */}
              {materia?.id && <input type="hidden" name="id" value={materia.id} />}
              
              {/* NOME DA MATÉRIA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria</label>
                <input 
                  name="nome" 
                  defaultValue={materia?.nome} 
                  required 
                  className="w-full border p-2 rounded-lg" 
                  placeholder="Ex: Introdução ao Antigo Testamento" 
                />
              </div>

              {/* VÍNCULO COM O CURSO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curso Vinculado</label>
                <select 
                  name="curso_id" 
                  defaultValue={materia?.curso_id || ''} 
                  required 
                  className="w-full border p-2 rounded-lg bg-white"
                >
                  <option value="" disabled>Selecione um curso...</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* STATUS (ATIVA / INATIVA) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status da Matéria</label>
                <select 
                  name="status" 
                  defaultValue={materia?.status || 'Ativa'} 
                  className="w-full border p-2 rounded-lg bg-white"
                >
                  <option value="Ativa">✅ Ativa (Disponível para matrículas)</option>
                  <option value="Inativa">❌ Inativa (Ocultar e desabilitar)</option>
                </select>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setAberto(false)} 
                  className="flex-1 bg-gray-100 p-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={carregando} 
                  className="flex-1 bg-blue-600 p-3 rounded-xl font-bold text-white disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  {carregando ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}