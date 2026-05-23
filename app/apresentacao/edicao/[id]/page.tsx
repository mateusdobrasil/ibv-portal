"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditarVisitante() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClientComponentClient();

  // Estados de Controle
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Busca inicial dos dados do visitante
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const { data, error } = await supabase
          .from('visitantes')
          .select('*, dependentes_acompanhantes(*)')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setNome(data.nome_visitante || "");
          setSetor(data.setor_trabalho || "");
          setEsposa(data.nome_esposa || "");
          setRepresentadoPor(data.representado_por || "");
          setTemFilhos(data.tem_filhos || false);
          setTemAcompanhantes(data.tem_acompanhantes || false);

          const dependentes = data.dependentes_acompanhantes || [];
          const listaFilhos = dependentes.filter((d: any) => d.tipo === 'FILHO').map((d: any) => d.nome);
          const listaAcompanhantes = dependentes.filter((d: any) => d.tipo === 'ACOMPANHANTE').map((d: any) => d.nome);

          setFilhos(listaFilhos.length > 0 ? listaFilhos : [""]);
          setAcompanhantes(listaAcompanhantes.length > 0 ? listaAcompanhantes : [""]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados", err);
        setMensagem("Erro ao carregar os dados do visitante.");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      carregarDados();
    }
  }, [id, supabase]);

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
    setSaving(true);
    setMensagem("");

    try {
      // 1. Atualizar tabela principal
      const { error: errorUpdate } = await supabase
        .from('visitantes')
        .update({
          nome_visitante: nome,
          setor_trabalho: setor,
          nome_esposa: esposa,
          representado_por: representadoPor,
          tem_filhos: temFilhos,
          tem_acompanhantes: temAcompanhantes
        })
        .eq('id', id);

      if (errorUpdate) throw errorUpdate;

      // 2. Limpar os dependentes antigos no banco para substituir pelos novos
      const { error: errorDelete } = await supabase
        .from('dependentes_acompanhantes')
        .delete()
        .eq('visitante_id', id);
      
      if (errorDelete) throw errorDelete;

      // 3. Preparar array de novos dependentes
      const novosDependentes: { visitante_id: string; nome: string; tipo: string }[] = [];
      
      if (temFilhos) {
        filhos.filter(f => f.trim() !== "").forEach(f => {
          novosDependentes.push({ visitante_id: id, nome: f, tipo: 'FILHO' });
        });
      }

      if (temAcompanhantes) {
        acompanhantes.filter(a => a.trim() !== "").forEach(a => {
          novosDependentes.push({ visitante_id: id, nome: a, tipo: 'ACOMPANHANTE' });
        });
      }

      // 4. Inserir dependentes atualizados
      if (novosDependentes.length > 0) {
        const { error: errorInsert } = await supabase
          .from('dependentes_acompanhantes')
          .insert(novosDependentes);
          
        if (errorInsert) throw errorInsert;
      }

      setMensagem("Cadastro atualizado com sucesso! Redirecionando...");
      
      // Volta para a tabela de edição após o sucesso e recarrega a rota
      setTimeout(() => {
        router.push('/apresentacao/edicao');
        router.refresh();
      }, 1500);
      
    } catch (error) {
      console.error("Erro na atualização:", error);
      setMensagem("Erro ao atualizar o cadastro. Verifique a conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-500 font-medium">Carregando dados do visitante...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Editar Visitante</h1>
          <Link href="/apresentacao/edicao" className="text-sm text-blue-600 hover:underline">
            ← Voltar para a Tabela
          </Link>
        </div>

        {mensagem && (
          <div className={`p-4 mb-6 rounded-md font-medium ${mensagem.includes("sucesso") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
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

          {/* Botões do Rodapé */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex gap-4">
            <button type="button" onClick={() => router.push('/apresentacao/edicao')} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}