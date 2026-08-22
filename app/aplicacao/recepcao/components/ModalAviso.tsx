"use client";

type TipoAviso = "erro" | "aviso" | "sucesso";

interface ModalAvisoProps {
  aberto: boolean;
  tipo?: TipoAviso;
  titulo?: string;
  mensagem: string;
  textoBotao?: string;
  onFechar: () => void;
}

const ESTILOS: Record<TipoAviso, { header: string; icon: string; botao: string }> = {
  erro:     { header: "bg-red-600",    icon: "text-red-600",    botao: "bg-red-600 hover:bg-red-700" },
  aviso:    { header: "bg-yellow-500", icon: "text-yellow-500", botao: "bg-yellow-500 hover:bg-yellow-600" },
  sucesso:  { header: "bg-green-600",  icon: "text-green-600",  botao: "bg-green-600 hover:bg-green-700" },
};

const TITULOS: Record<TipoAviso, string> = {
  erro: "Ops, algo deu errado",
  aviso: "Atenção",
  sucesso: "Sucesso",
};

export default function ModalAviso({ aberto, tipo = "aviso", titulo, mensagem, textoBotao = "Entendi", onFechar }: ModalAvisoProps) {
  if (!aberto) return null;

  const estilo = ESTILOS[tipo];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className={`${estilo.header} p-5 flex items-center gap-3`}>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            {tipo === "erro" && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {tipo === "aviso" && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            {tipo === "sucesso" && (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-bold text-white">{titulo || TITULOS[tipo]}</h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 whitespace-pre-wrap">{mensagem}</p>

          <button
            onClick={onFechar}
            className={`mt-6 w-full text-white font-bold py-3 rounded-lg transition-colors ${estilo.botao}`}
          >
            {textoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}
