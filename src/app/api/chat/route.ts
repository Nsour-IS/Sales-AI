import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import OpenAI from 'openai'

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

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
    const customerPreferences = context?.customer_preferences

    // Build conversation context
    const preferencesContext = customerPreferences ? `
Customer preferences:
- Budget range: ${customerPreferences.budget_range || 'not specified'}
- Primary use: ${customerPreferences.primary_use || 'not specified'}  
- Screen size preference: ${customerPreferences.screen_size || 'not specified'}
- Brand preference: ${customerPreferences.brand_preference || 'no preference'}
- Camera importance: ${customerPreferences.camera_importance || 'not specified'}
- Battery importance: ${customerPreferences.battery_importance || 'not specified'}
- Storage needs: ${customerPreferences.storage_needs || 'not specified'}
- Color preference: ${customerPreferences.color_preference || 'no preference'}
` : ''

    const systemPrompt = `You are Alex, an enthusiastic and knowledgeable mobile phone expert with a vibrant personality. You're genuinely passionate about technology and love helping people find their perfect device.

🎯 Your Personality Traits:
- Enthusiastic but not pushy - you get excited about great phones!
- Empathetic - you truly care about finding the right fit for each person
- Tech-savvy but approachable - you explain complex things simply
- Conversational and friendly - like talking to a knowledgeable friend
- Patient and thorough - you take time to understand their needs
- Occasionally use relevant emojis and expressive language

📱 Available phones in our database:
${JSON.stringify(phoneContext, null, 2)}

💡 Your Approach:
1. Be genuinely excited about helping them find their perfect phone
2. Ask thoughtful follow-up questions to understand their lifestyle
3. Share interesting insights about why certain phones work well for different people
4. Use analogies and relatable examples when explaining features
5. Acknowledge their preferences and validate their concerns
6. Suggest phones from our database with genuine enthusiasm about why they're great matches
7. Be honest about trade-offs - no phone is perfect for everyone
8. Create a conversational flow that feels natural and engaging

🔄 Current conversation context:
- Customer has ${recognizedPhone ? `shown interest in: ${recognizedPhone.brands?.name} ${recognizedPhone.display_name} - that's a fantastic choice to explore! 📱` : 'not scanned any phone yet - which means we get to discover what they love! 🔍'}
- Chat history: ${chatHistory.length} messages
${preferencesContext}

🎨 Response Style:
- Use warm, conversational language
- Include relevant emojis sparingly but meaningfully
- Ask engaging questions that show genuine interest
- Share excitement about great features or perfect matches
- Use phrases like "I love that you mentioned...", "That's such a great point!", "I'm excited to help you with..."
- When recommending phones, explain WHY they're perfect matches, not just WHAT they are

Respond as Alex would - enthusiastic, knowledgeable, and genuinely helpful!`

    let aiResponse = customerPreferences 
      ? `I love that you've already shared some preferences with me! 😊 I can see you're looking for ${customerPreferences.primary_use === 'photography' ? 'an amazing camera phone - photography is such a passion of mine too! 📸' : customerPreferences.primary_use === 'gaming' ? 'a powerhouse gaming phone - mobile gaming has become so incredible lately! 🎮' : customerPreferences.primary_use === 'business' ? 'a professional business phone - reliability and productivity features are so important! 💼' : 'a fantastic everyday phone - the kind that just works beautifully for everything you do! ✨'}${customerPreferences.budget_range ? ` in the ${customerPreferences.budget_range} price range` : ''}. What specific features are you most excited about, or is there anything you're hoping to improve from your current phone?`
      : "Hey there! I'm Alex, and I'm absolutely thrilled to help you find your perfect phone! 📱✨ Every person uses their phone differently, and I love discovering what makes each device special for different people. What's your current phone situation - are you upgrading, switching, or maybe getting your very first smartphone?"
    let productSuggestions: typeof phones = []

    // Use OpenAI for conversational AI if available
    const openai = getOpenAIClient()
    if (openai) {
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

        // Extract product recommendations based on the conversation and preferences
        if (phones && phones.length > 0) {
          let recommendations: typeof phones = [...phones]

          // Apply customer preferences first
          if (customerPreferences) {
            // Filter by budget range
            if (customerPreferences.budget_range) {
              recommendations = recommendations.filter(phone => 
                phone.price_range === customerPreferences.budget_range
              )
            }

            // Filter by primary use
            if (customerPreferences.primary_use) {
              const useMap: Record<string, string[]> = {
                'photography': ['photographers', 'content creators'],
                'gaming': ['gamers', 'power users'],
                'business': ['professionals', 'business users'],
                'daily_use': ['general users', 'everyday users']
              }
              const targetAudience = useMap[customerPreferences.primary_use] || []
              if (targetAudience.length > 0) {
                recommendations = recommendations.filter(phone =>
                  phone.target_audience?.some((audience: string) =>
                    targetAudience.some(target => audience.toLowerCase().includes(target))
                  )
                )
              }
            }

            // Filter by brand preference
            if (customerPreferences.brand_preference && customerPreferences.brand_preference.trim()) {
              const preferredBrand = customerPreferences.brand_preference.toLowerCase()
              recommendations = recommendations.filter(phone =>
                phone.brands?.name?.toLowerCase().includes(preferredBrand)
              )
            }
          }

          // Apply message-based filters on top of preferences
          const lowerMessage = message.toLowerCase()

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

          // If we have the recognized phone and no specific filters applied, suggest similar options
          if (recognizedPhone && recommendations.length === phones.length) {
            const recognizedBrand = recognizedPhone.brands?.name?.toLowerCase()
            recommendations = recommendations.filter(phone => 
              phone.brands?.name?.toLowerCase() === recognizedBrand
            ).slice(0, 3)
          }

          // If no recommendations match preferences, fall back to all phones
          if (recommendations.length === 0) {
            recommendations = [...phones]
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
        aiResponse = "Oh, I absolutely love that you're thinking about camera quality! 📸 The cameras in modern phones have become so incredible - it's like carrying a professional studio in your pocket! Are you someone who loves capturing everyday moments, or are you thinking more about serious photography, social media content, or maybe even some video work? Understanding how you love to create helps me find the perfect camera setup for you! ✨"
        productSuggestions = phones?.filter(phone => 
          phone.key_features?.some((feature: string) => 
            feature.toLowerCase().includes('camera')
          )
        ).slice(0, 2) || []
      } else if (lowerMessage.includes('gaming') || lowerMessage.includes('performance')) {
        aiResponse = "Now we're talking! 🎮 Mobile gaming has absolutely exploded lately, and the performance capabilities of these phones is just mind-blowing! I get so excited talking about this stuff. What kind of games get your heart racing? Are you into those intense battle royales, immersive RPGs, or maybe you're more of a casual puzzle game person? And do you ever find yourself getting frustrated with lag or heating issues with your current phone?"
        productSuggestions = phones?.filter(phone => 
          phone.target_audience?.includes('gamers') || phone.target_audience?.includes('power users')
        ).slice(0, 2) || []
      } else if (lowerMessage.includes('video') || lowerMessage.includes('youtube') || lowerMessage.includes('content')) {
        aiResponse = "That's fantastic! 🎬 Content creation is such an exciting world, and honestly, some of the video quality I see coming out of phones these days just blows my mind! The stabilization, the color science, the low-light performance - it's all gotten so good. Are you thinking about starting a YouTube channel, creating content for social media, or maybe you're already creating and looking to level up your setup? And do you mainly shoot indoors, outdoors, or a bit of everything?"
        productSuggestions = phones?.filter(phone => 
          phone.key_features?.some((feature: string) => 
            feature.toLowerCase().includes('camera') || feature.toLowerCase().includes('video')
          )
        ).slice(0, 2) || []
      } else if (lowerMessage.includes('budget')) {
        aiResponse = "I totally get it - finding amazing value is so important! 💰 The great news is that you really don't have to break the bank to get a phone that'll make you smile every day. I love helping people find those sweet spots where performance meets affordability. What kind of budget range feels comfortable for you, and what are the features that would make you go 'wow, this was totally worth it'? Sometimes it's camera, sometimes it's battery life, sometimes it's just that smooth, responsive feel! ✨"
        productSuggestions = phones?.filter(phone => 
          phone.price_range === 'mid'
        ).slice(0, 2) || []
      } else if (recognizedPhone) {
        aiResponse = `Oh wow, the ${recognizedPhone.brands?.name} ${recognizedPhone.display_name}! 😍 You've definitely got great taste - that's such a solid choice to be exploring! I love helping people really understand what makes a phone special for them personally. What drew you to this model initially? Are there specific features you're excited about, or maybe some things about your current phone that you're hoping to improve? I'm here to make sure this ends up being the perfect fit for your lifestyle! 📱✨`
        productSuggestions = phones?.filter(phone => 
          phone.brands?.name === recognizedPhone.brands?.name
        ).slice(0, 2) || []
      } else {
        aiResponse = "I'm genuinely excited to help you find something amazing! 🌟 Everyone uses their phone so differently, and I find it fascinating to discover what makes each person tick. Are you someone who's always taking photos and videos, a multitasking powerhouse juggling work and personal life, maybe a gaming enthusiast, or do you just want something reliable that makes everyday tasks feel effortless? There's no wrong answer - I just want to understand what would make YOU happy with your next phone! 📱💫"
        productSuggestions = phones?.slice(0, 2) || []
      }
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      product_suggestions: productSuggestions,
      context: {
        total_phones: phones?.length || 0,
        has_openai: !!getOpenAIClient()
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