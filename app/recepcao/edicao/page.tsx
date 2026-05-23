"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import logo from "../../imgs/logo.png";

export default function EdicaoVisitante() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [eventoAtivoId, setEventoAtivoId] = useState<string | null>(null);
  const [nomeEvento, setNomeEvento] = useState<string>(""); 

  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [visitanteEditando, setVisitanteEditando] = useState<any | null>(null);

  // Estados dos inputs de edição (Reativos)
  const [tipo, setTipo] = useState("Visitas");
  const [nome, setNome] = useState("");
  const [representadoPor, setRepresentadoPor] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataAniversario, setDataAniversario] = useState("");
  
  // Exclusivos de Visitas
  const [setor, setSetor] = useState("");
  const [esposa, setEsposa] = useState("");
  const [foiApresentado, setFoiApresentado] = useState(false);
  const [dependentes, setDependentes] = useState<any[]>([]);

  // 1. Checa o cookie do evento ao carregar e busca o nome dele
  useEffect(() => {
    const carregarEvento = async () => {
      const cookieEvento = document.cookie
        .split('; ')
        .find(row => row.startsWith('evento_ativo='))
        ?.split('=')[1];

      if (cookieEvento) {
        setEventoAtivoId(cookieEvento);
        const { data } = await supabase.from('eventos').select('nome_evento').eq('id', cookieEvento).single();
        if (data) setNomeEvento(data.nome_evento);
      } else {
        alert("Nenhum evento selecionado. Redirecionando para o painel principal...");
        router.push("/recepcao");
      }
    };
    carregarEvento();
  }, [router, supabase]);

  // 2. Função central de busca
  const fetchVisitantes = useCallback(async (busca = "") => {
    if (!eventoAtivoId) return;

    setBuscando(true);
    setMensagem("");
    setVisitanteEditando(null);

    let query = supabase
      .from("visitantes")
      .select(`*, dependentes_acompanhantes (*)`)
      .eq("evento_id", eventoAtivoId)
      .order("created_at", { ascending: false });

    if (busca.trim() !== "") {
      query = query.ilike("nome_visitante", `%${busca.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      setMensagem(`Erro na busca: ${error.message}`);
    } else {
      setResultados(data || []);
    }
    setBuscando(false);
  }, [eventoAtivoId, supabase]);

  useEffect(() => {
    if (eventoAtivoId) {
      fetchVisitantes(""); 
    }
  }, [eventoAtivoId, fetchVisitantes]);

  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVisitantes(termoBusca);
  };

  const alternarStatusApresentacao = async (id: string, statusAtual: boolean) => {
    const novoStatus = !statusAtual;
    const { error } = await supabase.from("visitantes").update({ foi_apresentado: novoStatus }).eq("id", id);
    if (error) {
      setMensagem(`Erro ao atualizar status: ${error.message}`);
    } else {
      setResultados(resultados.map(v => v.id === id ? { ...v, foi_apresentado: novoStatus } : v));
    }
  };

  // 6. Carregar para Edição Completa (Inline)
  const iniciarEdicao = (visitante: any) => {
    setVisitanteEditando(visitante);
    setTipo(visitante.tipo || "Visitas");
    setNome(visitante.nome_visitante || "");
    setRepresentadoPor(visitante.representado_por || "");
    setObservacoes(visitante.observacoes || "");
    setDataAniversario(visitante.data_aniversario || "");
    setSetor(visitante.setor_trabalho || "");
    setEsposa(visitante.nome_esposa || "");
    setFoiApresentado(visitante.foi_apresentado);
    setDependentes(visitante.dependentes_acompanhantes || []);
    setResultados([]); // Oculta a lista enquanto edita
  };

  const adicionarDependente = (tipoDep: string) => {
    setDependentes([...dependentes, { nome: "", tipo: tipoDep, novo: true }]);
  };

  const atualizarNomeDependente = (index: number, novoNome: string) => {
    const novos = [...dependentes];
    novos[index].nome = novoNome;
    setDependentes(novos);
  };

  const marcarParaExclusao = (index: number) => {
    const novos = [...dependentes];
    if (novos[index].novo) {
      novos.splice(index, 1);
    } else {
      novos[index].excluido = true;
    }
    setDependentes(novos);
  };

  // 7. Salvar Alterações
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setMensagem("");

    try {
      const { error: errorVisitante } = await supabase
        .from("visitantes")
        .update({
          tipo: tipo,
          nome_visitante: nome,
          representado_por: (tipo === 'Visitas' || tipo === 'Pedido de Oraçao') ? representadoPor : null,
          observacoes: (tipo !== 'Visitas') ? observacoes : null,
          data_aniversario: (tipo === 'Aniversários') ? dataAniversario : null,
          setor_trabalho: tipo === 'Visitas' ? setor : null,
          nome_esposa: tipo === 'Visitas' ? esposa : null,
          foi_apresentado: foiApresentado
        })
        .eq("id", visitanteEditando.id);

      if (errorVisitante) throw errorVisitante;

      // Gerenciar Dependentes apenas se for Visitas. Se mudou de tipo, apaga.
      if (tipo === 'Visitas') {
        for (const dep of dependentes) {
          if (dep.excluido && dep.id) {
            await supabase.from("dependentes_acompanhantes").delete().eq("id", dep.id);
          } else if (dep.novo && dep.nome.trim() !== "") {
            await supabase.from("dependentes_acompanhantes").insert([{ 
              visitante_id: visitanteEditando.id, 
              evento_id: eventoAtivoId,
              nome: dep.nome, 
              tipo: dep.tipo 
            }]);
          } else if (!dep.excluido && dep.id) {
            await supabase.from("dependentes_acompanhantes").update({ nome: dep.nome }).eq("id", dep.id);
          }
        }
      } else {
        await supabase.from("dependentes_acompanhantes").delete().eq("visitante_id", visitanteEditando.id);
      }

      setMensagem("Registro atualizado com sucesso!");
      setVisitanteEditando(null);
      setTermoBusca("");
      fetchVisitantes(""); // Recarrega a lista
    } catch (error: any) {
      console.error(error);
      setMensagem(`Erro ao atualizar: ${error.message}`);
    } finally {
      setBuscando(false);
    }
  };

  // 8. Excluir Visitante
  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este registro permanentemente?")) return;
    
    setBuscando(true);
    const { error } = await supabase.from("visitantes").delete().eq("id", id);
    
    if (error) {
      setMensagem(`Erro ao excluir: ${error.message}`);
    } else {
      setMensagem("Registro excluído com sucesso.");
      setVisitanteEditando(null);
      setResultados(resultados.filter(r => r.id !== id));
    }
    setBuscando(false);
  };

  // Funções Auxiliares de Formatação
  const formatarLista = (lista: string[]) => {
    if (lista.length === 0) return "";
    if (lista.length === 1) return lista[0];
    const ultimos = lista[lista.length - 1];
    const primeiros = lista.slice(0, -1);
    return primeiros.join(', ') + ' e ' + ultimos;
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "";
    return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // Lógica de Rótulos do Formulário Dinâmico
  let labelNome = "Nome Principal *";
  if (tipo === "Visitas") labelNome = "Nome do Visitante *";
  if (tipo === "Aniversários") labelNome = "Nome do Aniversariante *";
  if (tipo === "Pedido de Oraçao") labelNome = "Para quem é a oração? *";
  if (tipo === "Aviso") labelNome = "Quem está dando o aviso? (Ou título) *";

  if (!eventoAtivoId) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <img src={logo.src} alt="Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edição de Registros</h1>
              <p className="text-sm font-bold text-blue-600 mt-1">Evento: {nomeEvento || "Carregando..."}</p>
            </div>
          </div>
          <Link href="/recepcao" className="text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            ← Voltar ao Painel
          </Link>
        </div>

        {mensagem && (
          <div className={`p-4 mb-6 rounded-md font-medium ${mensagem.includes("sucesso") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {mensagem}
          </div>
        )}

        {/* Busca */}
        {!visitanteEditando && (
          <div className="mb-8">
            <form onSubmit={handleBuscaSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Buscar por nome ou título..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button type="submit" disabled={buscando} className="bg-gray-800 text-white px-6 font-bold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50">
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </form>
          </div>
        )}

        {/* Resultados */}
        {!visitanteEditando && resultados.length === 0 && !buscando && (
           <p className="text-center text-gray-500 py-10">A lista está vazia. Cadastre pessoas para exibí-las aqui.</p>
        )}

        {!visitanteEditando && resultados.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Lista de Cadastros ({resultados.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {resultados.map((visitante) => {
                const tipoV = visitante.tipo || 'Visitas';
                const filhos = visitante.dependentes_acompanhantes?.filter((d: any) => d.tipo === 'FILHO').map((f: any) => f.nome) || [];
                const acompanhantes = visitante.dependentes_acompanhantes?.filter((d: any) => d.tipo === 'ACOMPANHANTE').map((a: any) => a.nome) || [];

                return (
                  <div key={visitante.id} className="p-4 flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      
                      {/* Título com Tag de Tipo */}
                      <h4 className="font-bold text-gray-900 text-lg mb-2 flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold
                          ${tipoV === 'Aniversários' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                            tipoV === 'Pedido de Oraçao' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 
                            tipoV === 'Aviso' ? 'bg-red-100 text-red-800 border border-red-300' : 
                            'bg-blue-100 text-blue-800 border border-blue-300'}`}>
                          {tipoV}
                        </span>
                        {visitante.nome_visitante}
                      </h4>
                      
                      {/* Corpo do Registro Dinâmico */}
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        {tipoV === 'Visitas' && (
                          <>
                            {visitante.setor_trabalho && <p><span className="font-medium">Vindo de:</span> {visitante.setor_trabalho}</p>}
                            {visitante.representado_por && <p><span className="font-medium">Representado por:</span> {visitante.representado_por}</p>}
                            {visitante.nome_esposa && <p><span className="font-medium">Esposa:</span> {visitante.nome_esposa}</p>}
                            {filhos.length > 0 && <p><span className="font-medium">Filhos:</span> {formatarLista(filhos)}</p>}
                            {acompanhantes.length > 0 && <p><span className="font-medium">Acompanhantes:</span> {formatarLista(acompanhantes)}</p>}
                          </>
                        )}

                        {tipoV === 'Aniversários' && (
                          <>
                            {visitante.data_aniversario && <p><span className="font-medium">Data:</span> {formatarData(visitante.data_aniversario)}</p>}
                            {visitante.observacoes && <p><span className="font-medium">Obs:</span> {visitante.observacoes}</p>}
                          </>
                        )}

                        {tipoV === 'Pedido de Oraçao' && (
                          <>
                            {visitante.representado_por && <p><span className="font-medium">Quem pediu:</span> {visitante.representado_por}</p>}
                            {visitante.observacoes && <p><span className="font-medium">Motivo:</span> {visitante.observacoes}</p>}
                          </>
                        )}

                        {tipoV === 'Aviso' && (
                          <>
                            {visitante.observacoes && <p><span className="font-medium">Recado:</span> {visitante.observacoes}</p>}
                          </>
                        )}
                      </div>

                      {/* Status Atual */}
                      <div className="text-sm font-medium flex gap-2 items-center">
                        <span className={`w-3 h-3 rounded-full ${visitante.foi_apresentado ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                        <span className={visitante.foi_apresentado ? "text-green-700" : "text-yellow-600"}>
                          {visitante.foi_apresentado ? "Concluído / Apresentado" : "Aguardando na Fila"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                      <button 
                        onClick={() => alternarStatusApresentacao(visitante.id, visitante.foi_apresentado)} 
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold transition-colors ${
                          visitante.foi_apresentado ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {visitante.foi_apresentado ? "Voltar para Fila" : "Marcar Apresentado"}
                      </button>

                      <button onClick={() => iniciarEdicao(visitante)} className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                        Editar Info
                      </button>
                      <button onClick={() => handleExcluir(visitante.id)} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulário de Edição Completa (Inline) */}
        {visitanteEditando && (
          <form onSubmit={handleSalvarEdicao} className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h2 className="text-lg font-bold text-blue-800">Editando: {visitanteEditando.nome_visitante}</h2>
              <button type="button" onClick={() => { setVisitanteEditando(null); fetchVisitantes(""); }} className="text-sm font-bold text-gray-500 hover:text-gray-700 bg-white px-3 py-1 rounded-lg border shadow-sm">
                ← Cancelar e Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* TIPO */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-blue-700 mb-1">Tipo de Registro *</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full p-3 border-2 border-blue-200 bg-blue-50 text-blue-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold">
                  <option value="Visitas">Visitas</option>
                  <option value="Aniversários">Aniversários</option>
                  <option value="Pedido de Oraçao">Pedido de Oração</option>
                  <option value="Aviso">Aviso</option>
                </select>
              </div>

              {/* ORDEM DO PEDIDO DE ORAÇÃO */}
              {tipo === "Pedido de Oraçao" && (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quem pediu? (Opcional)</label>
                  <input type="text" value={representadoPor} onChange={(e) => setRepresentadoPor(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              )}

              {/* CAMPO PRINCIPAL */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{labelNome}</label>
                <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* CONDIÇÃO: VISITAS */}
              {tipo === "Visitas" && (
                <>
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
                </>
              )}

              {/* CONDIÇÃO: ANIVERSÁRIOS */}
              {tipo === "Aniversários" && (
                <>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data do Aniversário *</label>
                    <input type="date" required value={dataAniversario} onChange={(e) => setDataAniversario(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Detalhes</label>
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                  </div>
                </>
              )}

              {/* CONDIÇÃO: PEDIDO DE ORAÇÃO */}
              {tipo === "Pedido de Oraçao" && (
                <>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o pedido? *</label>
                    <textarea value={observacoes} required onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                  </div>
                </>
              )}

              {/* CONDIÇÃO: AVISO */}
              {tipo === "Aviso" && (
                <>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aviso / Recado *</label>
                    <textarea value={observacoes} required onChange={(e) => setObservacoes(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                  </div>
                </>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* DEPENDENTES (APENAS VISITAS) */}
            {tipo === "Visitas" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700">Filhos</h3>
                    <button type="button" onClick={() => adicionarDependente('FILHO')} className="text-sm text-blue-600 font-medium hover:underline">+ Adicionar</button>
                  </div>
                  <div className="space-y-3">
                    {dependentes.filter(d => d.tipo === 'FILHO' && !d.excluido).length === 0 && <p className="text-sm text-gray-400 italic">Nenhum filho cadastrado.</p>}
                    {dependentes.map((dep, index) => {
                      if (dep.tipo !== 'FILHO' || dep.excluido) return null;
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <input type="text" value={dep.nome} onChange={(e) => atualizarNomeDependente(index, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Nome do filho" />
                          <button type="button" onClick={() => marcarParaExclusao(index)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700">Acompanhantes</h3>
                    <button type="button" onClick={() => adicionarDependente('ACOMPANHANTE')} className="text-sm text-green-600 font-medium hover:underline">+ Adicionar</button>
                  </div>
                  <div className="space-y-3">
                    {dependentes.filter(d => d.tipo === 'ACOMPANHANTE' && !d.excluido).length === 0 && <p className="text-sm text-gray-400 italic">Nenhum acompanhante cadastrado.</p>}
                    {dependentes.map((dep, index) => {
                      if (dep.tipo !== 'ACOMPANHANTE' || dep.excluido) return null;
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <input type="text" value={dep.nome} onChange={(e) => atualizarNomeDependente(index, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Nome do acompanhante" />
                          <button type="button" onClick={() => marcarParaExclusao(index)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={buscando} className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 mt-8 text-lg">
              {buscando ? "Salvando Alterações..." : "Salvar Alterações e Voltar"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}