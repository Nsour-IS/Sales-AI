import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = await createClient()
    
    // Get all available phones for recommendations
    const { data: phones, error: phonesError } = await supabase
      .from('mobile_phones')
      .select(`
        *,
        brands (
          name,
          logo_url
        )
      `)
      .eq('is_available', true)

    if (phonesError) {
      console.error('Database error:', phonesError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Create context for the AI
    const phoneContext = phones?.map(phone => ({
      brand: phone.brands?.name,
      model: phone.display_name,
      price_range: phone.price_range,
      screen_size: phone.screen_size,
      processor: phone.processor,
      key_features: phone.key_features,
      target_audience: phone.target_audience
    })) || []

    const recognizedPhone = context?.recognized_phone
    const chatHistory = context?.chat_history || []

    // Build conversation context
    const systemPrompt = `You are a knowledgeable mobile phone sales assistant. Your goal is to help customers find the perfect mobile phone based on their needs.

Available phones in our database:
${JSON.stringify(phoneContext, null, 2)}

Guidelines:
1. Be friendly, helpful, and conversational
2. Ask clarifying questions about budget, usage, preferences
3. Recommend specific phones from our database that match their needs
4. Compare phones when asked
5. Explain technical features in simple terms
6. Focus on benefits, not just specifications
7. Always suggest phones from our available inventory

Current conversation context:
- Customer has ${recognizedPhone ? `shown interest in: ${recognizedPhone.brands?.name} ${recognizedPhone.display_name}` : 'not scanned any phone yet'}
- Chat history: ${chatHistory.length} messages

Respond naturally and helpfully. When recommending phones, format your response to include specific models from our database.`

    let aiResponse = "I'd be happy to help you find the perfect phone! What's most important to you - camera quality, battery life, performance, or something else?"
    let productSuggestions: typeof phones = []

    // Use OpenAI for conversational AI if available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory.slice(-6).map((msg: { sender_type: string; message_text: string }) => ({
              role: msg.sender_type === 'user' ? 'user' : 'assistant',
              content: msg.message_text
            })),
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })

        aiResponse = response.choices[0]?.message?.content || aiResponse

        // Extract product recommendations based on the conversation
        if (phones && phones.length > 0) {
          // Simple recommendation logic based on keywords
          const lowerMessage = message.toLowerCase()
          let recommendations: typeof phones = [...phones]

          // Filter by mentioned preferences
          if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
            recommendations = recommendations.filter(phone => 
              phone.key_features?.some((feature: string) => 
                feature.toLowerCase().includes('camera') || feature.toLowerCase().includes('photo')
              )
            )
          }

          if (lowerMessage.includes('gaming') || lowerMessage.includes('performance')) {
            recommendations = recommendations.filter(phone => 
              phone.target_audience?.includes('gamers') || phone.target_audience?.includes('power users')
            )
          }

          if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
            recommendations = recommendations.filter(phone => phone.price_range === 'mid' || phone.price_range === 'low')
          }

          if (lowerMessage.includes('premium') || lowerMessage.includes('flagship') || lowerMessage.includes('best')) {
            recommendations = recommendations.filter(phone => phone.price_range === 'high')
          }

          // If we have the recognized phone, suggest similar or better options
          if (recognizedPhone && recommendations.length === phones.length) {
            const recognizedBrand = recognizedPhone.brands?.name?.toLowerCase()
            recommendations = recommendations.filter(phone => 
              phone.brands?.name?.toLowerCase() === recognizedBrand
            ).slice(0, 3)
          }

          // Limit to top 3 suggestions
          productSuggestions = recommendations.slice(0, 3)
        }

      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        // Use fallback responses
        if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest')) {
          aiResponse = "Based on what I can see, I'd recommend checking out our flagship models. They offer great performance and camera quality!"
          productSuggestions = phones?.slice(0, 2) || [] as typeof phones
        }
      }
    } else {
      // Fallback conversational responses without OpenAI
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('camera')) {
        aiResponse = "Great choice! Camera quality is really important. Are you interested in photography, social media, or professional content creation?"
        productSuggestions = phones?.filter(phone => 
          phone.key_features?.some((feature: string) => 
            feature.toLowerCase().includes('camera')
          )
        ).slice(0, 2) || []
      } else if (lowerMessage.includes('gaming') || lowerMessage.includes('performance')) {
        aiResponse = "For gaming and performance, you'll want a phone with a powerful processor and good cooling. What types of games do you play?"
        productSuggestions = phones?.filter(phone => 
          phone.target_audience?.includes('gamers') || phone.target_audience?.includes('power users')
        ).slice(0, 2) || []
      } else if (lowerMessage.includes('budget')) {
        aiResponse = "I understand you're looking for good value! What's your budget range, and what features are most important to you?"
        productSuggestions = phones?.filter(phone => 
          phone.price_range === 'mid'
        ).slice(0, 2) || []
      } else if (recognizedPhone) {
        aiResponse = `The ${recognizedPhone.brands?.name} ${recognizedPhone.display_name} is a great choice! What specific features are you most interested in?`
        productSuggestions = phones?.filter(phone => 
          phone.brands?.name === recognizedPhone.brands?.name
        ).slice(0, 2) || []
      } else {
        aiResponse = "I'd love to help you find the perfect phone! What do you primarily use your phone for - work, photography, gaming, or everyday tasks?"
        productSuggestions = phones?.slice(0, 2) || []
      }
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      product_suggestions: productSuggestions,
      context: {
        total_phones: phones?.length || 0,
        has_openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here'
      }
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}