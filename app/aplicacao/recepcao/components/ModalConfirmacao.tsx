"use client";

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo?: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  perigo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmacao({
  aberto,
  titulo = "Confirmar ação",
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  if (!aberto) return null;

  const corHeader = perigo ? "bg-red-600" : "bg-yellow-500";
  const corBotao  = perigo ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className={`${corHeader} p-5 flex items-center gap-3`}>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">{titulo}</h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 whitespace-pre-wrap">{mensagem}</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancelar}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {textoCancelar}
            </button>
            <button
              onClick={onConfirmar}
              className={`flex-1 text-white font-bold py-3 rounded-lg transition-colors ${corBotao}`}
            >
              {textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
