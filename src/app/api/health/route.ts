import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      supabase_anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      supabase_service: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      openai_key: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      anthropic_key: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
    }

    return NextResponse.json({
      status: 'healthy',
      diagnostics
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}