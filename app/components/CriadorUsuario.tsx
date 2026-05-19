'use client'

import { useState } from 'react'
import { criarUsuario } from '../actions/usuarios'

export default function CriadorUsuario() {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
        + Novo Usuário
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Cadastrar no Sistema</h3>
        
        {erro && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{erro}</div>}

        <form action={async (formData) => {
          setCarregando(true)
          setErro('')
          try {
            await criarUsuario(formData)
            setAberto(false)
          } catch (e: any) {
            setErro(e.message)
          } finally {
            setCarregando(false)
          }
        }} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input type="text" name="nome_completo" required placeholder="Ex: João da Silva" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input type="email" name="email" required placeholder="joao@email.com" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input type="text" name="cpf" placeholder="000.000.000-00" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso *</label>
              <select name="tipo_usuario" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="cadastro">Cadastro (Recepção)</option>
                <option value="tesoureiro">Tesoureiro</option>
                <option value="secretario">Secretário</option>
                <option value="administrador">Administrador Geral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Polo de Estudo *</label>
              <select name="polo" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="IBV">IBV</option>
                <option value="IBUC">IBUC</option>
                <option value="EBD">EBD</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setAberto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancelar</button>
            <button type="submit" disabled={carregando} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition">
              {carregando ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}