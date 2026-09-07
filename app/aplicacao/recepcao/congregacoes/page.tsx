"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import logo from "../../imgs/logo.png";
import ModalConfirmacao from "../components/ModalConfirmacao";
import {
  listarCongregacoes,
  criarCongregacao,
  atualizarSenhaCongregacao,
  alternarAtivoCongregacao,
  excluirCongregacao,
} from "@/app/aplicacao/actions/recepcao-congregacoes";
import {
  listarTiposEvento,
  criarTipoEvento,
  alternarAtivoTipoEvento,
  excluirTipoEvento,
} from "@/app/aplicacao/actions/recepcao-tipos-evento";

export default function GerenciarCongregacoes() {
  const [congregacoes, setCongregacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [nomeNovo, setNomeNovo] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [senhaEmEdicaoId, setSenhaEmEdicaoId] = useState<string | null>(null);
  const [senhaEditada, setSenhaEditada] = useState("");
  const [revelarId, setRevelarId] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<{ mensagem: string; onConfirmar: () => void } | null>(null);

  // --- TIPOS DE CULTO ---
  const [tiposEvento, setTiposEvento] = useState<any[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [nomeTipoNovo, setNomeTipoNovo] = useState("");
  const [salvandoTipo, setSalvandoTipo] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarCongregacoes();
      setCongregacoes(data || []);
      setErro("");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarTipos = useCallback(async () => {
    setLoadingTipos(true);
    try {
      const data = await listarTiposEvento();
      setTiposEvento(data || []);
      setErro("");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoadingTipos(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    carregarTipos();
  }, [carregar, carregarTipos]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");
    try {
      const fd = new FormData();
      fd.set("nome", nomeNovo);
      fd.set("senha", senhaNova);
      await criarCongregacao(fd);
      setNomeNovo("");
      setSenhaNova("");
      setMensagem("Congregação cadastrada com sucesso.");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarSenha = async (id: string, nome: string) => {
    setErro("");
    setMensagem("");
    try {
      await atualizarSenhaCongregacao(id, senhaEditada, nome);
      setSenhaEmEdicaoId(null);
      setSenhaEditada("");
      setMensagem("Senha atualizada com sucesso.");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const handleAlternarAtivo = async (id: string, ativoAtual: boolean, nome: string) => {
    setErro("");
    try {
      await alternarAtivoCongregacao(id, ativoAtual, nome);
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const handleExcluir = (id: string, nome: string) => {
    setConfirmacao({
      mensagem: `Tem certeza que deseja excluir o acesso da congregação "${nome}"? Essa senha deixará de funcionar imediatamente.`,
      onConfirmar: async () => {
        setConfirmacao(null);
        setErro("");
        try {
          await excluirCongregacao(id, nome);
          setMensagem("Congregação removida com sucesso.");
          await carregar();
        } catch (e: any) {
          setErro(e.message);
        }
      },
    });
  };

  const handleCriarTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoTipo(true);
    setErro("");
    setMensagem("");
    try {
      const fd = new FormData();
      fd.set("nome", nomeTipoNovo);
      await criarTipoEvento(fd);
      setNomeTipoNovo("");
      setMensagem("Tipo de culto cadastrado com sucesso.");
      await carregarTipos();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvandoTipo(false);
    }
  };

  const handleAlternarAtivoTipo = async (id: string, ativoAtual: boolean, nome: string) => {
    setErro("");
    try {
      await alternarAtivoTipoEvento(id, ativoAtual, nome);
      await carregarTipos();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const handleExcluirTipo = (id: string, nome: string) => {
    setConfirmacao({
      mensagem: `Tem certeza que deseja excluir o tipo de culto "${nome}"?`,
      onConfirmar: async () => {
        setConfirmacao(null);
        setErro("");
        try {
          await excluirTipoEvento(id, nome);
          setMensagem("Tipo de culto removido com sucesso.");
          await carregarTipos();
        } catch (e: any) {
          setErro(e.message);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <img src={logo.src} alt="Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Congregações</h1>
              <p className="text-sm font-bold text-orange-600 mt-1">Gerencie as senhas de acesso de cada congregação</p>
            </div>
          </div>
          <Link href="/aplicacao/recepcao" className="text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            ← Voltar ao Painel
          </Link>
        </div>

        {erro && (
          <div className="p-4 mb-6 rounded-md font-medium bg-red-50 text-red-700 border border-red-200">{erro}</div>
        )}
        {mensagem && (
          <div className="p-4 mb-6 rounded-md font-medium bg-green-50 text-green-700 border border-green-200">{mensagem}</div>
        )}

        {/* Cadastro de nova congregação */}
        <form onSubmit={handleCriar} className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Nome da Congregação</label>
            <input
              type="text"
              required
              placeholder="Ex: Sede, Jardim, Vila Nova..."
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              className="w-full p-3 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Senha de Acesso</label>
            <input
              type="text"
              required
              placeholder="Senha exclusiva desta congregação"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              className="w-full p-3 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
            />
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="w-full md:w-auto bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {salvando ? "Salvando..." : "+ Adicionar"}
          </button>
        </form>

        {/* Lista de congregações */}
        {loading ? (
          <p className="text-center text-gray-400 py-10">Carregando...</p>
        ) : congregacoes.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Nenhuma congregação cadastrada ainda.</p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
            {congregacoes.map((c) => (
              <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.ativo ? 'bg-green-500' : 'bg-gray-300'}`} title={c.ativo ? 'Ativa' : 'Desativada'} />
                  <span className="font-bold text-gray-800">{c.nome_congregacao}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {senhaEmEdicaoId === c.id ? (
                    <>
                      <input
                        type="text"
                        autoFocus
                        value={senhaEditada}
                        onChange={(e) => setSenhaEditada(e.target.value)}
                        placeholder="Nova senha"
                        className="p-2 border border-gray-300 rounded-lg text-sm w-40 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <button onClick={() => handleSalvarSenha(c.id, c.nome_congregacao)} className="text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg">
                        Salvar
                      </button>
                      <button onClick={() => { setSenhaEmEdicaoId(null); setSenhaEditada(""); }} className="text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-mono text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[7rem] text-center">
                        {revelarId === c.id ? c.senha : "••••••••"}
                      </span>
                      <button onClick={() => setRevelarId(revelarId === c.id ? null : c.id)} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2">
                        {revelarId === c.id ? "Ocultar" : "Ver"}
                      </button>
                      <button onClick={() => { setSenhaEmEdicaoId(c.id); setSenhaEditada(""); }} className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg">
                        Alterar Senha
                      </button>
                      <button onClick={() => handleAlternarAtivo(c.id, c.ativo, c.nome_congregacao)} className={`text-sm font-bold px-3 py-2 rounded-lg ${c.ativo ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>
                        {c.ativo ? "Desativar" : "Ativar"}
                      </button>
                      <button onClick={() => handleExcluir(c.id, c.nome_congregacao)} className="text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg">
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-400 mt-6">
          Ao acessar com a senha de uma congregação, o local do evento fica travado com o nome dela — a congregação só enxerga e cria eventos com esse local.
        </p>

        {/* ---------------- SEÇÃO: TIPOS DE CULTO ---------------- */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Tipos de Culto</h2>
          <p className="text-sm font-bold text-teal-600 mt-1 mb-6">Padronize os nomes usados ao criar um novo evento</p>

          <form onSubmit={handleCriarTipo} className="bg-teal-50/50 border border-teal-100 rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">Nome do Tipo de Culto</label>
              <input
                type="text"
                required
                placeholder="Ex: Culto de Celebração"
                value={nomeTipoNovo}
                onChange={(e) => setNomeTipoNovo(e.target.value)}
                className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-medium text-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={salvandoTipo}
              className="w-full md:w-auto bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {salvandoTipo ? "Salvando..." : "+ Adicionar"}
            </button>
          </form>

          {loadingTipos ? (
            <p className="text-center text-gray-400 py-10">Carregando...</p>
          ) : tiposEvento.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Nenhum tipo de culto cadastrado ainda.</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
              {tiposEvento.map((t) => (
                <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.ativo ? 'bg-green-500' : 'bg-gray-300'}`} title={t.ativo ? 'Ativo' : 'Desativado'} />
                    <span className="font-bold text-gray-800">{t.nome}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => handleAlternarAtivoTipo(t.id, t.ativo, t.nome)} className={`text-sm font-bold px-3 py-2 rounded-lg ${t.ativo ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>
                      {t.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => handleExcluirTipo(t.id, t.nome)} className="text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalConfirmacao
        aberto={!!confirmacao}
        perigo
        mensagem={confirmacao?.mensagem || ""}
        onConfirmar={() => confirmacao?.onConfirmar()}
        onCancelar={() => setConfirmacao(null)}
      />
    </div>
  );
}
