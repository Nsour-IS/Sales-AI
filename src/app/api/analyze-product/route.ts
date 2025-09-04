import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = await createClient()
    
    // For now, simulate AI analysis - we'll add OpenAI Vision later
    const mockAnalysis = {
      recognized_phone_id: null,
      confidence_score: 0.85,
      ai_analysis: {
        detected_features: ['screen', 'camera', 'body'],
        estimated_brand: 'Apple',
        estimated_model: 'iPhone 15 Pro',
        color: 'Black',
        condition: 'new'
      }
    }

    // Get mobile phones from database to match against
    const { data: phones, error } = await supabase
      .from('mobile_phones')
      .select(`
        *,
        brands (
          name,
          logo_url
        )
      `)
      .eq('is_available', true)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Simple matching logic (we'll enhance this with real AI)
    const matchedPhone = phones?.find(phone => 
      phone.brands?.name?.toLowerCase().includes('apple') &&
      phone.model_name.toLowerCase().includes('iphone')
    )

    if (matchedPhone) {
      mockAnalysis.recognized_phone_id = matchedPhone.id
    }

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      matched_phone: matchedPhone,
      total_phones_in_db: phones?.length || 0
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}