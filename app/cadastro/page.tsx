'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cadastrarAluno } from '../actions/cadastro'

export default function CadastroPage() {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      await cadastrarAluno(new FormData(e.currentTarget))
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar cadastro.')
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Cabeçalho do Formulário */}
        <div className="bg-blue-900 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">Ficha de Matrícula - IBV</h2>
          <p className="text-blue-200 mt-2">Preencha com seus dados completos para ingressar.</p>
          <p className="text-sm mt-4">Já tem cadastro? <Link href="/login" className="font-bold underline hover:text-blue-300">Faça login</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {erro && <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium">{erro}</div>}

          {/* 1. DADOS DE ACESSO */}
          <section>
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-4">1. Dados de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 mb-1">E-mail *</label><input type="email" name="email" required className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Senha (mín. 6 dígitos) *</label><input type="password" name="senha" required minLength={6} className="w-full border p-2 rounded-md" /></div>
            </div>
          </section>

          {/* 2. DADOS PESSOAIS */}
          <section>
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-4">2. Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2"><label className="block text-sm text-gray-700 mb-1">Nome Completo *</label><input type="text" name="nome" required className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Celular/WhatsApp *</label><input type="text" name="telefone" required className="w-full border p-2 rounded-md" /></div>
              
              <div><label className="block text-sm text-gray-700 mb-1">Data Nasc.</label><input type="date" name="data_nascimento" className="w-full border p-2 rounded-md text-gray-600" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Sexo</label>
                <select name="sexo" className="w-full border p-2 rounded-md">
                  <option value="">Selecione...</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option>
                </select>
              </div>
              <div><label className="block text-sm text-gray-700 mb-1">Estado Civil</label><input type="text" name="estado_civil" className="w-full border p-2 rounded-md" /></div>

              <div><label className="block text-sm text-gray-700 mb-1">CPF</label><input type="text" name="cpf" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">RG</label><input type="text" name="rg" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Nacionalidade</label><input type="text" name="nacionalidade" defaultValue="Brasileira" className="w-full border p-2 rounded-md" /></div>
              
              <div><label className="block text-sm text-gray-700 mb-1">Cidade de Nascimento</label><input type="text" name="cidade_nascimento" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Estado (UF)</label><input type="text" name="estado_nascimento" maxLength={2} className="w-full border p-2 rounded-md uppercase" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Profissão</label><input type="text" name="profissao" className="w-full border p-2 rounded-md" /></div>
            </div>
          </section>

          {/* 3. ENDEREÇO */}
          <section>
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-4">3. Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3"><label className="block text-sm text-gray-700 mb-1">Endereço (Rua, Número)</label><input type="text" name="endereco" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Complemento</label><input type="text" name="complemento" className="w-full border p-2 rounded-md" /></div>
              
              <div className="md:col-span-2"><label className="block text-sm text-gray-700 mb-1">Bairro</label><input type="text" name="bairro" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Cidade</label><input type="text" name="cidade" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">CEP</label><input type="text" name="cep" className="w-full border p-2 rounded-md" /></div>
            </div>
          </section>

          {/* 4. ACADÊMICO */}
          <section>
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-4">4. Perfil Acadêmico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 mb-1">Escolaridade</label><input type="text" name="escolaridade" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Qual Curso? (Se superior)</label><input type="text" name="qual_curso" className="w-full border p-2 rounded-md" /></div>
              
              <div><label className="block text-sm text-gray-700 mb-1">Já possui curso de Teologia?</label>
                <select name="possui_teologia" className="w-full border p-2 rounded-md"><option value="Não">Não</option><option value="Sim">Sim</option></select>
              </div>
              <div><label className="block text-sm text-gray-700 mb-1">Se sim, qual?</label><input type="text" name="qual_teologia" className="w-full border p-2 rounded-md" /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-700 mb-1">Onde cursou?</label><input type="text" name="onde_teologia" className="w-full border p-2 rounded-md" /></div>
            </div>
          </section>

          {/* 5. HISTÓRICO ECLESIÁSTICO */}
          <section>
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-4">5. Histórico Eclesiástico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 mb-1">Igreja Atual</label><input type="text" name="igreja" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Local da Igreja</label><input type="text" name="local_igreja" className="w-full border p-2 rounded-md" /></div>
              
              <div><label className="block text-sm text-gray-700 mb-1">Nome do Pastor</label><input type="text" name="pastor" className="w-full border p-2 rounded-md" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Departamento de atuação</label><input type="text" name="departamento" className="w-full border p-2 rounded-md" /></div>

              <div><label className="block text-sm text-gray-700 mb-1">Possui Cargo?</label>
                <select name="possui_cargo" className="w-full border p-2 rounded-md"><option value="Não">Não</option><option value="Sim">Sim</option></select>
              </div>
              <div><label className="block text-sm text-gray-700 mb-1">Qual Cargo?</label><input type="text" name="qual_cargo" className="w-full border p-2 rounded-md" /></div>
              
              <div><label className="block text-sm text-gray-700 mb-1">Data de Conversão</label><input type="date" name="data_conversao" className="w-full border p-2 rounded-md text-gray-600" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">Data de Batismo</label><input type="date" name="data_batismo" className="w-full border p-2 rounded-md text-gray-600" /></div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-blue-600 text-white rounded-lg p-4 text-lg font-bold mt-8 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? 'Registrando seus dados...' : 'Finalizar Cadastro e Acessar o Portal'}
          </button>
          
        </form>
      </div>
    </div>
  )
}