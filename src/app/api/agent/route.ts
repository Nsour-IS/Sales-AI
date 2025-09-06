// Agentic Jad API Route - Powered by Contextual Decision Engine
import { NextRequest, NextResponse } from 'next/server'
import { getJadEngine, DecisionContext } from '@/lib/agent/engine'
import { trackPersonalityInteraction } from '@/lib/analytics'

interface AgentChatRequest {
  message: string
  sessionId: string
  customerId?: string
  context?: {
    recognized_phone?: {
      brands?: { name?: string; logo_url?: string } | null
      display_name?: string
    }
    chat_history?: Array<{
      id: string
      sender_type: 'user' | 'ai' | 'system'
      message_text: string
      timestamp: Date | string
    }>
    customer_preferences?: {
      budget_range?: string
      primary_use?: string
      screen_size?: string
      brand_preference?: string
      battery_importance?: string
      camera_importance?: string
      storage_needs?: string
      color_preference?: string
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AgentChatRequest = await req.json()
    const { message, sessionId, customerId, context } = body

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    // Initialize the agentic engine
    const jadEngine = getJadEngine()

    // Build conversation history for context
    const conversationHistory = (context?.chat_history || []).map(msg => ({
      role: (msg.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.message_text,
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString()
    }))

    // Create decision context
    const decisionContext: DecisionContext = {
      sessionId,
      customerId,
      userInput: message,
      currentIntent: 'auto_detect',
      conversationHistory,
      environmentContext: {
        recognized_phone: context?.recognized_phone,
        customer_preferences: context?.customer_preferences,
        platform: 'web',
        timestamp: new Date().toISOString()
      }
    }

    // Track the interaction
    trackPersonalityInteraction('agentic_decision', {
      session_id: sessionId,
      customer_id: customerId,
      input_length: message.length,
      has_context: !!context?.recognized_phone
    })

    // Make intelligent decision
    const startTime = Date.now()
    const decision = await jadEngine.makeDecision(decisionContext)
    const decisionTime = Date.now() - startTime

    // Track decision performance
    trackPersonalityInteraction('decision_made', {
      action: decision.action,
      confidence: decision.confidence,
      decision_time_ms: decisionTime
    })

    // Handle different decision actions
    let response = ''
    const additionalData: Record<string, unknown> = {}

    switch (decision.action) {
      case 'direct_response':
        response = decision.response || "I'm here to help! What would you like to know?"
        break

      case 'execute_workflow':
        if (decision.workflowId) {
          // Execute the workflow
          const workflowResult = await jadEngine.executeWorkflow(decision.workflowId)
          
          if (workflowResult.success) {
            response = "Great! I've analyzed everything and here's what I found for you! 🎉"
            additionalData.workflow_result = workflowResult.result
          } else {
            response = "I'm working on that for you! Let me gather some more information... 🔍"
            additionalData.workflow_error = workflowResult.error
          }
        } else {
          response = "Let me think about the best way to help you with that! 🤔"
        }
        break

      case 'use_tool':
        response = "Let me look that up for you right away! 🔍"
        if (decision.toolName && decision.toolParameters) {
          // This could trigger background tool execution
          additionalData.tool_execution = {
            tool: decision.toolName,
            parameters: decision.toolParameters
          }
        }
        break

      case 'clarify':
        response = decision.response || "I want to make sure I give you the best help possible!"
        if (decision.followUpQuestions && decision.followUpQuestions.length > 0) {
          response += "\n\nHere are a few questions to help me understand better:\n"
          decision.followUpQuestions.forEach((q, i) => {
            response += `\n${i + 1}. ${q}`
          })
        }
        break

      case 'gather_info':
        response = "Let me gather some information to give you the most accurate answer! 📊"
        break

      default:
        response = "I'm here to help you find your perfect phone! What would you like to explore? 📱✨"
    }

    // Add personality and enthusiasm to responses
    response = enhanceWithPersonality(response, decision.confidence)

    // Get current agent state for debugging
    const agentState = await jadEngine.getAgentState(sessionId)
    
    return NextResponse.json({
      message: response,
      decision: {
        action: decision.action,
        confidence: decision.confidence,
        reasoning: decision.reasoning
      },
      agent_state: agentState?.currentMode,
      performance: {
        decision_time_ms: decisionTime,
        confidence: decision.confidence
      },
      additional_data: additionalData
    })

  } catch (error) {
    console.error('Agentic chat error:', error)
    
    // Track the error
    trackPersonalityInteraction('agentic_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json({
      message: "Oops! 😅 I'm having a little technical moment here. Don't worry though - I'm still super excited to help you find the perfect phone! Could you try asking me again?",
      decision: {
        action: 'direct_response',
        confidence: 0.3,
        reasoning: 'Error fallback response'
      },
      error: 'Internal server error'
    })
  }
}

function enhanceWithPersonality(response: string, confidence: number): string {
  // Add personality based on confidence level
  if (confidence > 0.8) {
    // High confidence - be enthusiastic
    if (!response.includes('!') && !response.includes('🎉')) {
      response += ' ✨'
    }
  } else if (confidence < 0.5) {
    // Low confidence - be more thoughtful
    if (!response.includes('🤔') && !response.includes('thinking')) {
      response = `Let me think about this carefully... ${response}`
    }
  }

  // Ensure Jad's enthusiastic tone
  const enthusiasmMarkers = ['!', '✨', '🎉', '🌟', '😊', '👍', '🔥', '💫']
  if (!enthusiasmMarkers.some(marker => response.includes(marker))) {
    response += ' 😊'
  }

  return response
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  try {
    const jadEngine = getJadEngine()
    const agentState = await jadEngine.getAgentState(sessionId)
    const activeWorkflows = await jadEngine.getActiveWorkflows(sessionId)
    
    return NextResponse.json({
      agent_state: agentState,
      active_workflows: activeWorkflows,
      status: 'healthy'
    })
  } catch (error) {
    console.error('Agent status error:', error)
    return NextResponse.json(
      { error: 'Failed to get agent status' },
      { status: 500 }
    )
  }
}