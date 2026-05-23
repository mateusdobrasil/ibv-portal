"use client";

import { useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import logo from "../../imgs/logo.png"; // Importação da imagem

export default function CadastroVisitante() {
  // Inicializa o cliente do Supabase para componentes Client-side
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // Dados principais
  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");
  const [esposa, setEsposa] = useState("");
  const [representadoPor, setRepresentadoPor] = useState("");

  // Controles condicionais
  const [temFilhos, setTemFilhos] = useState(false);
  const [temAcompanhantes, setTemAcompanhantes] = useState(false);

  // Arrays dinâmicos
  const [filhos, setFilhos] = useState<string[]>([""]);
  const [acompanhantes, setAcompanhantes] = useState<string[]>([""]);

  const adicionarCampo = (setter: React.Dispatch<React.SetStateAction<string[]>>, state: string[]) => {
    setter([...state, ""]);
  };

  const atualizarArray = (index: number, valor: string, setter: React.Dispatch<React.SetStateAction<string[]>>, state: string[]) => {
    const novoArray = [...state];
    novoArray[index] = valor;
    setter(novoArray);
  };

  const removerCampo = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, state: string[]) => {
    const novoArray = state.filter((_, i) => i !== index);
    setter(novoArray.length > 0 ? novoArray : [""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    try {
      // 1. Inserir na tabela visitantes
      const { data: visitante, error: errorVisitante } = await supabase
        .from('visitantes')
        .insert([{
          nome_visitante: nome,
          setor_trabalho: setor,
          nome_esposa: esposa,
          representado_por: representadoPor,
          tem_filhos: temFilhos,
          tem_acompanhantes: temAcompanhantes
        }])
        .select()
        .single();

      if (errorVisitante) throw errorVisitante;

      // 2. Preparar array de dependentes se houver
      const dependentes: { visitante_id: string; nome: string; tipo: string }[] = [];
      
      if (temFilhos) {
        filhos.filter(f => f.trim() !== "").forEach(f => {
          dependentes.push({ visitante_id: visitante.id, nome: f, tipo: 'FILHO' });
        });
      }

      if (temAcompanhantes) {
        acompanhantes.filter(a => a.trim() !== "").forEach(a => {
          dependentes.push({ visitante_id: visitante.id, nome: a, tipo: 'ACOMPANHANTE' });
        });
      }

      // 3. Inserir dependentes na tabela secundária, caso existam
      if (dependentes.length > 0) {
        const { error: errorDependentes } = await supabase
          .from('dependentes_acompanhantes')
          .insert(dependentes);
          
        if (errorDependentes) throw errorDependentes;
      }

      setMensagem("Cadastro realizado com sucesso!");
      
      // Limpar formulário após sucesso para o próximo cadastro
      setNome(""); setSetor(""); setEsposa(""); setRepresentadoPor("");
      setTemFilhos(false); setTemAcompanhantes(false);
      setFilhos([""]); setAcompanhantes([""]);
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setMensagem("Erro ao cadastrar. Verifique a conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        
        {/* Cabeçalho com Logo */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <img src={logo.src} alt="Logo AD Vinhedo" className="h-12 w-auto object-contain" />
            <h1 className="text-2xl font-bold text-gray-800">Cadastro de Visitante</h1>
          </div>
          <Link href="/apresentacao" className="text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            ← Voltar ao Painel
          </Link>
        </div>

        {mensagem && (
          <div className={`p-4 mb-6 rounded-md font-medium ${mensagem.includes("sucesso") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Visitante *</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor de Trabalho (Congregação)</label>
              <input type="text" value={setor} onChange={(e) => setSetor(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Representado por (Se houver)</label>
              <input type="text" value={representadoPor} onChange={(e) => setRepresentadoPor(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Esposa</label>
              <input type="text" value={esposa} onChange={(e) => setEsposa(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Seção Filhos */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-4">
              <input type="checkbox" checked={temFilhos} onChange={(e) => setTemFilhos(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-gray-800 font-medium">Possui filhos acompanhando?</span>
            </label>

            {temFilhos && (
              <div className="pl-6 space-y-3 border-l-2 border-blue-100">
                {filhos.map((filho, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Nome do Filho {index + 1}</label>
                      <input type="text" value={filho} onChange={(e) => atualizarArray(index, e.target.value, setFilhos, filhos)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    {filhos.length > 1 && (
                      <button type="button" onClick={() => removerCampo(index, setFilhos, filhos)} className="text-red-500 hover:text-red-700 p-2 font-medium">
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => adicionarCampo(setFilhos, filhos)} className="text-sm text-blue-600 font-medium hover:underline mt-2">
                  + Adicionar outro filho
                </button>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Seção Acompanhantes */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-4">
              <input type="checkbox" checked={temAcompanhantes} onChange={(e) => setTemAcompanhantes(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-gray-800 font-medium">Possui outros acompanhantes?</span>
            </label>

            {temAcompanhantes && (
              <div className="pl-6 space-y-3 border-l-2 border-green-100">
                {acompanhantes.map((acompanhante, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Nome do Acompanhante {index + 1}</label>
                      <input type="text" value={acompanhante} onChange={(e) => atualizarArray(index, e.target.value, setAcompanhantes, acompanhantes)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    {acompanhantes.length > 1 && (
                      <button type="button" onClick={() => removerCampo(index, setAcompanhantes, acompanhantes)} className="text-red-500 hover:text-red-700 p-2 font-medium">
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => adicionarCampo(setAcompanhantes, acompanhantes)} className="text-sm text-green-600 font-medium hover:underline mt-2">
                  + Adicionar outro acompanhante
                </button>
              </div>
            )}
          </div>

          {/* Botão Salvar */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 mt-8 text-lg">
            {loading ? "Salvando..." : "Salvar Cadastro"}
          </button>

        </form>
      </div>
    </div>
  );
}