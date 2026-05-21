import pptxgen from "pptxgenjs"
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { data, resumoGeral, periodoLabel } = await request.json()

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado para exportar' },
        { status: 400 }
      )
    }

    // Criar apresentação
    const pres = new pptxgen()

    // 1. DEFINIÇÕES GERAIS
    pres.layout = 'LAYOUT_WIDE' // Slide Widescreen (16:9)
    pres.defineLayout({ name: 'IBV', width: 13.33, height: 7.5 })

    // --- SLIDE 1: CAPA ---
    const slideCapa = pres.addSlide()
    slideCapa.background = { color: "1E1B4B" } // Indigo 950 (Fundo escuro)
    
    slideCapa.addText("INSTITUTO BÍBLICO DE VINHEDO", {
      x: 0.5, y: 2.5, w: "90%", fontSize: 44, color: "FACC15", bold: true, align: "center", fontFace: "Arial"
    })
    slideCapa.addText(`Relatório de Desempenho - EBD`, {
      x: 0.5, y: 3.5, w: "90%", fontSize: 32, color: "FFFFFF", align: "center"
    })
    slideCapa.addText(periodoLabel || "Resumo Geral", {
      x: 0.5, y: 4.5, w: "90%", fontSize: 20, color: "94A3B8", align: "center"
    })

    // --- SLIDE 2: RESUMO GERAL ---
    if (resumoGeral) {
      const slideResumo = pres.addSlide()
      slideResumo.addText("RESUMO GERAL DA ESCOLA", { x: 0.5, y: 0.5, fontSize: 28, bold: true, color: "1E1B4B" })

      const metrics = [
        { label: "PRESENTES", val: resumoGeral.presentes, color: "3B82F6", x: 0.5 },
        { label: "BÍBLIAS", val: resumoGeral.biblias, color: "10B981", x: 3.1 },
        { label: "REVISTAS", val: resumoGeral.revistas, color: "8B5CF6", x: 5.7 },
        { label: "VISITANTES", val: resumoGeral.visitantes, color: "F59E0B", x: 8.3 },
        { label: "OFERTA", val: `R$ ${resumoGeral.oferta.toFixed(2)}`, color: "059669", x: 10.9 },
      ]

      metrics.forEach(m => {
        slideResumo.addShape(pres.ShapeType.rect, { x: m.x, y: 2, w: 2.3, h: 3, fill: { color: "F8FAFC" }, line: { color: m.color, width: 2 } })
        slideResumo.addText(m.label, { x: m.x, y: 2.5, w: 2.3, fontSize: 14, align: "center", bold: true, color: "64748B" })
        slideResumo.addText(String(m.val), { x: m.x, y: 3.5, w: 2.3, fontSize: 24, align: "center", bold: true, color: m.color })
      })
    }

    // --- SLIDE 3: TABELA DETALHADA ---
    const slideTabela = pres.addSlide()
    slideTabela.addText("DESEMPENHO POR TURMA", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "1E1B4B" })

    const rows: any[][] = [
      ["TURMA", "PRESENTES", "BÍBLIAS", "REVISTAS", "VISITANTES", "OFERTA"]
    ]

    data.forEach((t: any) => {
      rows.push([
        t.nome,
        t.presentes.toString(),
        t.biblias.toString(),
        t.revistas.toString(),
        t.visitantes.toString(),
        `R$ ${t.oferta.toFixed(2)}`
      ])
    })

    slideTabela.addTable(rows, {
      x: 0.5, y: 1.5, w: 12.3,
      border: { type: "solid", color: "E2E8F0", pt: 1 },
      fill: { color: "FFFFFF" },
      fontSize: 12,
      color: "1E293B",
      align: "center",
      autoPage: true,
      colW: [4, 1.6, 1.6, 1.6, 1.6, 1.9]
    })

    // Gerar arquivo como buffer usando write()
    const buffer = await (pres as any).write()

    // Retornar como resposta com headers apropriados
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="Relatorio_EBD_IBV_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pptx"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PPTX:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar apresentação' },
      { status: 500 }
    )
  }
}
