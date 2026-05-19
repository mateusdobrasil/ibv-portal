'use client'

import { useState } from 'react'
import { salvarCurso } from '../actions/cursos'

interface CriadorCursoProps {
  curso?: any // Se receber o curso, é Edição. Se não receber, é Cadastro.
}

export default function CriadorCurso({ curso }: CriadorCursoProps) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleAcao(formData: FormData) {
    setCarregando(true)
    try {
      await salvarCurso(formData)
      setAberto(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setAberto(true)} 
        // Muda o estilo do botão dependendo se é editar ou criar
        className={curso 
          ? "text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition" 
          : "bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        }
      >
        {curso ? 'Editar' : '+ Cadastrar Novo Curso'}
      </button>

      {aberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-blue-900 p-6 text-white">
              <h2 className="text-xl font-bold">{curso ? 'Editar Curso' : 'Novo Curso'}</h2>
            </div>
            
            <form action={handleAcao} className="p-6 space-y-4">
              {/* O campo ID escondido garante que o sistema saiba que é para editar */}
              {curso?.id && <input type="hidden" name="id" value={curso.id} />}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso</label>
                <input name="nome" defaultValue={curso?.nome} required className="w-full border p-2 rounded-lg" placeholder="Ex: Teologia Básica" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea name="descricao" defaultValue={curso?.descricao} className="w-full border p-2 rounded-lg" placeholder="Breve descrição do curso..." rows={3}></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (em meses)</label>
                  <input name="duracao" defaultValue={curso?.duracao} className="w-full border p-2 rounded-lg" placeholder="Ex: 12 meses" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (mensalidade)</label>
                  <input name="valor_mensalidade" type="number" step="0.01" defaultValue={curso?.valor_mensalidade} className="w-full border p-2 rounded-lg" placeholder="Ex: 150.00" />
                </div>
              </div>

              {/* O CAMPO DE STATUS PARA ATIVAR OU INATIVAR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status do Curso</label>
                <select name="status" defaultValue={curso?.status || 'Ativo'} className="w-full border p-2 rounded-lg bg-white">
                  <option value="Ativo">✅ Ativo (Visível para Matrículas)</option>
                  <option value="Inativo">❌ Inativo (Desabilitado)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setAberto(false)} className="flex-1 bg-gray-100 p-3 rounded-xl font-bold text-gray-600">Cancelar</button>
                <button type="submit" disabled={carregando} className="flex-1 bg-blue-600 p-3 rounded-xl font-bold text-white disabled:opacity-50">
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