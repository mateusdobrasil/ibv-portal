'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function BotaoExportarEBD({ elementId }: { elementId: string }) {
  
  const handleExport = async () => {
    const input = document.getElementById(elementId)
    if (!input) return

    // Captura o elemento
    const canvas = await html2canvas(input, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    
    // Configura o PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('relatorio-ebd.pdf')
  }

  return (
    <button 
      onClick={handleExport}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
    >
      <span>⬇️</span> Exportar PDF da EBD
    </button>
  )
}