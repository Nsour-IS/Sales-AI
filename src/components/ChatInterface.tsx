'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, ShoppingCart, Star, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

interface ChatMessage {
  id: string
  sender_type: 'user' | 'ai' | 'system'
  message_text: string
  timestamp: Date
  product_suggestions?: unknown[]
}

interface ChatInterfaceProps {
  recognizedPhone?: {
    brands?: { name?: string; logo_url?: string } | null
    display_name?: string
  }
  onStartChat?: () => void
  customerPreferences?: {
    budget_range?: 'low' | 'mid' | 'high' | ''
    primary_use?: 'photography' | 'gaming' | 'business' | 'daily_use' | ''
    screen_size?: 'compact' | 'standard' | 'large' | ''
    brand_preference?: string
    battery_importance?: 'low' | 'medium' | 'high' | ''
    camera_importance?: 'low' | 'medium' | 'high' | ''
    storage_needs?: 'basic' | 'moderate' | 'high' | ''
    color_preference?: string
  } | null
}

export default function ChatInterface({ recognizedPhone, customerPreferences }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isVoiceTyping, setIsVoiceTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<unknown>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognitionRef.current as any).continuous = false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognitionRef.current as any).interimResults = false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognitionRef.current as any).lang = 'en-US'
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognitionRef.current as any).onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setIsListening(false)
          animateTextTyping(transcript)
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognitionRef.current as any).onerror = () => {
          setIsListening(false)
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognitionRef.current as any).onend = () => {
          setIsListening(false)
        }
        
        setSpeechSupported(true)
      }
      
      // Initialize speech synthesis
      if (window.speechSynthesis) {
        speechSynthesisRef.current = window.speechSynthesis
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Initialize chat with welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        sender_type: 'ai',
        message_text: recognizedPhone 
          ? `Hey there! 👋 I'm Jad, your enthusiastic phone expert! I can see you're checking out the ${recognizedPhone.brands?.name} ${recognizedPhone.display_name} - that's such a great choice to explore! 🌟 I'm genuinely excited to help you find your perfect device. What drew you to this model, and what are you hoping your next phone will do for you?`
          : "Hey there! 👋 I'm Jad, and I'm absolutely thrilled to meet you! I'm a bit of a phone enthusiast (okay, maybe more than a bit! 😄), and I genuinely love helping people discover their perfect device. Every person uses their phone differently, and that's what makes this so exciting! What's your current phone situation - are you looking to upgrade, or maybe exploring something completely new? 📱✨",
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [recognizedPhone, messages.length])

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_type: 'user',
      message_text: inputText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          context: {
            recognized_phone: recognizedPhone,
            chat_history: messages,
            customer_preferences: customerPreferences
          }
        }),
      })

      const result = await response.json()

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: result.message || "I'm here to help! Can you tell me more about what you're looking for?",
        timestamp: new Date(),
        product_suggestions: result.product_suggestions
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Speak the AI response if voice is enabled
      if (isVoiceEnabled && speechSynthesisRef.current) {
        speakText(aiMessage.message_text)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: "Oops! 😅 I seem to be having a little technical hiccup right now. Could you try asking me again? I'm still here and excited to help you find your perfect phone!",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const speakText = (text: string) => {
    if (speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      speechSynthesisRef.current.speak(utterance)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(recognitionRef.current as any).stop()
      setIsListening(false)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(recognitionRef.current as any).start()
      setIsListening(true)
    }
  }

  const animateTextTyping = (text: string) => {
    setIsVoiceTyping(true)
    setInputText('')
    
    let currentIndex = 0
    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setInputText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typeInterval)
        setIsVoiceTyping(false)
        // Auto-send after typing animation completes
        setTimeout(() => {
          if (text.trim()) {
            sendVoiceMessage(text)
          }
        }, 300)
      }
    }, 50) // 50ms per character for smooth typing effect
  }

  const sendVoiceMessage = async (messageText: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_type: 'user',
      message_text: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          context: {
            recognized_phone: recognizedPhone,
            chat_history: messages,
            customer_preferences: customerPreferences
          }
        }),
      })

      const result = await response.json()

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: result.message || "I'm here to help! Can you tell me more about what you're looking for?",
        timestamp: new Date(),
        product_suggestions: result.product_suggestions
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Speak the AI response if voice is enabled
      if (isVoiceEnabled && speechSynthesisRef.current) {
        speakText(aiMessage.message_text)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: "Oops! 😅 I seem to be having a little technical hiccup right now. Could you try asking me again? I'm still here and excited to help you find your perfect phone!",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
    if (isVoiceEnabled && speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Jad - Your Phone Expert 🌟</h3>
            <p className="text-blue-100 text-sm">
              {recognizedPhone ? 'Excited to explore this choice with you!' : 'Ready to find your perfect phone together! 📱'}
            </p>
          </div>
          
          {/* Voice Controls */}
          {speechSupported && (
            <div className="flex gap-2">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-full transition-colors ${
                  isVoiceEnabled ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-300 hover:bg-blue-400'
                }`}
                title={isVoiceEnabled ? 'Voice responses on' : 'Voice responses off'}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-white" />
                ) : (
                  <VolumeX className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4" style={{ maxHeight: '450px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-sm md:max-w-md ${message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                message.sender_type === 'user' ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                {message.sender_type === 'user' ? (
                  <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <Bot className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                )}
              </div>
              <div className={`p-4 md:p-5 rounded-xl ${
                message.sender_type === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-md' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <p className="text-sm md:text-base leading-relaxed">{message.message_text}</p>
                
                {/* Product Suggestions */}
                {message.product_suggestions && message.product_suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Recommended for you:</p>
                    {message.product_suggestions.map((phone, index) => {
                      const typedPhone = phone as { brands?: { name?: string }; display_name?: string; screen_size?: number; processor?: string }
                      return (
                      <div key={index} className="bg-white p-3 rounded-lg border text-gray-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-sm">{typedPhone.brands?.name} {typedPhone.display_name}</h4>
                            <p className="text-xs text-gray-600">
                              {typedPhone.screen_size}&quot; • {typedPhone.processor}
                            </p>
                            <div className="flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600 ml-1">Perfect match</span>
                            </div>
                          </div>
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-blue-50 p-3 rounded-xl rounded-bl-md border border-blue-200">
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-blue-600 mr-2">Jad is thinking</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 border-t">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "🎤 Listening... speak away!" : isVoiceTyping ? "✨ Converting your voice to text..." : "Tell me what you're looking for, ask about phones, or just say hi! 😊"}
            className={`flex-1 p-4 md:p-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-lg ${
              isListening ? 'bg-red-50 border-red-300' : isVoiceTyping ? 'bg-blue-50 border-blue-300' : ''
            } touch-manipulation`}
            disabled={isTyping || isListening || isVoiceTyping}
          />
          
          {/* Voice Input Button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={isTyping || isVoiceTyping}
              className={`p-4 md:p-5 rounded-xl transition-colors touch-manipulation ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white' 
                  : isVoiceTyping
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700'
              }`}
              title={isListening ? 'Stop listening' : isVoiceTyping ? 'Processing voice...' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          )}
          
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isTyping || isListening || isVoiceTyping}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 text-white p-4 md:p-5 rounded-xl transition-colors touch-manipulation"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        
        {/* Voice Status */}
        {speechSupported && (isListening || isVoiceTyping) && (
          <div className="mt-2 text-center">
            {isListening && (
              <p className="text-red-600 text-sm font-medium animate-pulse">
                🎤 Listening... Speak now
              </p>
            )}
            {isVoiceTyping && (
              <p className="text-blue-600 text-sm font-medium">
                ⌨️ Converting speech to text...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}