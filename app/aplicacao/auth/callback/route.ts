import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Troca o "code" do link de e-mail (recuperação de senha, etc.) por uma sessão de
// verdade, lendo o code_verifier do cookie certo (o mesmo onde a server action que
// disparou o e-mail o guardou). Fazer essa troca aqui, no servidor, antes de
// qualquer coisa renderizar no navegador, é o que garante que o cookie exista —
// tentar trocar direto no client component falha de forma inconsistente porque o
// client lê de localStorage, não do cookie que a server action gravou.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/aplicacao/redefinir-senha'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}${next}?error_description=${encodeURIComponent(error.message)}`)
  }

  // Sem "code": o Supabase já manda o motivo (ex.: link expirado/usado) direto
  // nos parâmetros — repassa pra tela final mostrar a mensagem certa.
  const erro = searchParams.get('error_description') || 'Link inválido.'
  return NextResponse.redirect(`${origin}${next}?error_description=${encodeURIComponent(erro)}`)
}
