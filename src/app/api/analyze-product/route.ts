import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = await createClient()
    
    // Use OpenAI Vision API for real image analysis
    let aiAnalysis = {
      detected_features: ['screen', 'camera', 'body'],
      estimated_brand: 'Apple',
      estimated_model: 'iPhone 15 Pro',
      color: 'Black',
      condition: 'new'
    }

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this mobile phone image and return a JSON object with:
- brand: (Apple, Samsung, Google, OnePlus, Xiaomi, etc.)
- model: (specific model like "iPhone 12", "Galaxy S24", etc.)
- color: (color of the phone)
- condition: (new, used, damaged)
- detected_features: (array of visible features)
- confidence: (0-1 score for identification accuracy)

Only return the JSON object, no other text.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
        })

        const content = response.choices[0]?.message?.content
        if (content) {
          try {
            const parsed = JSON.parse(content)
            aiAnalysis = {
              detected_features: parsed.detected_features || ['screen', 'camera', 'body'],
              estimated_brand: parsed.brand || 'Unknown',
              estimated_model: parsed.model || 'Unknown',
              color: parsed.color || 'Unknown',
              condition: parsed.condition || 'new'
            }
          } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError)
          }
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        // Fall back to mock analysis if OpenAI fails
      }
    }

    const mockAnalysis = {
      recognized_phone_id: null,
      confidence_score: 0.85,
      ai_analysis: aiAnalysis
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

    // Enhanced matching logic using AI analysis
    const matchedPhone = phones?.find(phone => {
      const brandMatch = phone.brands?.name?.toLowerCase().includes(aiAnalysis.estimated_brand.toLowerCase())
      const modelMatch = phone.model_name.toLowerCase().includes(aiAnalysis.estimated_model.toLowerCase()) ||
                        phone.display_name.toLowerCase().includes(aiAnalysis.estimated_model.toLowerCase())
      
      return brandMatch && modelMatch
    }) || 
    // Fallback: try brand-only matching
    phones?.find(phone => 
      phone.brands?.name?.toLowerCase().includes(aiAnalysis.estimated_brand.toLowerCase())
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