'use client'

import { useState } from "react"

interface ExportProps {
  data?: any[]
  resumoGeral?: {
    presentes: number
    biblias: number
    revistas: number
    visitantes: number
    oferta: number
  }
  periodoLabel?: string
}

export default function BotaoExportarEBD({ data, resumoGeral, periodoLabel }: ExportProps) {
  const [gerando, setGerando] = useState(false)

  const gerarPPTX = async () => {
    if (!data || data.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    try {
      setGerando(true)
      
      // Enviar dados para a API do servidor para gerar o PPTX
      const response = await fetch('/api/exportar-relatorio-ebd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          resumoGeral,
          periodoLabel
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar apresentação')
      }

      // Receber o arquivo PPTX como blob
      const blob = await response.blob()
      
      // Criar um link para download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Relatorio_EBD_IBV_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pptx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setGerando(false)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao gerar a apresentação. Tente novamente.')
      setGerando(false)
    }
  }

  return (
    <button 
      onClick={gerarPPTX}
      disabled={gerando}
      className="bg-indigo-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-800 transition flex items-center gap-2 shadow-md disabled:opacity-50"
    >
      {gerando ? "⏳ Gerando Apresentação..." : "📊 Exportar PPTX (Slides)"}
    </button>
  )
}