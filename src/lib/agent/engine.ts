// Agentic Jad - Contextual Decision Engine
// The central brain that coordinates memory, tools, and planning to make intelligent decisions

import { getJadMemory, CustomerProfile, ConversationMemory } from './memory';
import { getJadTools, ToolRegistry, ToolResult } from './tools';
import { getJadPlanner, JadTaskPlanner, Workflow, PlanningContext } from './planner';

export interface DecisionContext {
  sessionId: string;
  customerId?: string;
  userInput: string;
  currentIntent: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  environmentContext: Record<string, unknown>;
}

export interface DecisionResult {
  action: 'direct_response' | 'execute_workflow' | 'use_tool' | 'gather_info' | 'clarify';
  confidence: number; // 0-1
  reasoning: string;
  response?: string;
  workflowId?: string;
  toolName?: string;
  toolParameters?: Record<string, unknown>;
  followUpQuestions?: string[];
  recommendedActions?: string[];
}

export interface AgentState {
  sessionId: string;
  currentMode: 'listening' | 'thinking' | 'planning' | 'executing' | 'responding';
  activeWorkflows: string[];
  contextualAwareness: {
    customerPersona?: string;
    purchaseIntent: 'browsing' | 'researching' | 'ready_to_buy' | 'comparing';
    conversationStage: 'greeting' | 'discovery' | 'recommendation' | 'comparison' | 'closing';
    emotionalState?: 'excited' | 'confused' | 'frustrated' | 'satisfied';
  };
  performanceMetrics: {
    responseTime: number;
    accuracy: number;
    customerSatisfaction: number;
  };
}

export class JadContextualEngine {
  private memory: ReturnType<typeof getJadMemory>;
  private tools: ToolRegistry;
  private planner: JadTaskPlanner;
  private agentStates: Map<string, AgentState> = new Map();

  constructor() {
    this.memory = getJadMemory();
    this.tools = getJadTools();
    this.planner = getJadPlanner();
  }

  // Main decision-making method
  async makeDecision(context: DecisionContext): Promise<DecisionResult> {
    const startTime = Date.now();
    
    try {
      // Update agent state
      await this.updateAgentState(context.sessionId, 'thinking');
      
      // Gather contextual information
      const customerProfile = context.customerId 
        ? await this.memory.getCustomerProfile(context.customerId)
        : null;
      
      const conversationMemory = await this.memory.getConversationMemory(context.sessionId);
      const relevantMemories = await this.memory.getRelevantMemories(context.sessionId, context.userInput);
      
      // Analyze user intent and context
      const intentAnalysis = await this.analyzeIntent(context, customerProfile, conversationMemory);
      
      // Determine best action based on multiple factors
      const decision = await this.selectBestAction(context, intentAnalysis, customerProfile, conversationMemory);
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      await this.updatePerformanceMetrics(context.sessionId, responseTime, decision.confidence);
      
      // Store decision context for learning
      await this.storeDecisionContext(context, decision);
      
      return decision;
      
    } catch (error) {
      console.error('Decision engine error:', error);
      
      return {
        action: 'direct_response',
        confidence: 0.3,
        reasoning: 'Fallback response due to decision engine error',
        response: "I'm having trouble processing that right now. Could you please rephrase your question? I'm here to help you find the perfect phone! 📱"
      };
    } finally {
      await this.updateAgentState(context.sessionId, 'listening');
    }
  }

  private async analyzeIntent(
    context: DecisionContext, 
    customerProfile: CustomerProfile | null,
    conversationMemory: ConversationMemory
  ): Promise<{
    primaryIntent: string;
    confidence: number;
    subIntents: string[];
    emotionalContext: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const input = context.userInput.toLowerCase();
    const intentPatterns = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      product_inquiry: ['what is', 'tell me about', 'specs', 'features', 'price'],
      recommendation: ['recommend', 'suggest', 'best phone', 'which phone', 'help me choose'],
      comparison: ['compare', 'difference', 'versus', 'vs', 'better than'],
      purchase_intent: ['buy', 'purchase', 'order', 'where to buy', 'price'],
      technical_support: ['how to', 'problem', 'issue', 'not working', 'help'],
      price_inquiry: ['cost', 'price', 'expensive', 'cheap', 'budget']
    };

    let primaryIntent = 'general_inquiry';
    let maxConfidence = 0;
    const subIntents: string[] = [];

    // Pattern matching with context awareness
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      const matches = patterns.filter(pattern => input.includes(pattern)).length;
      const confidence = matches / patterns.length;
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        primaryIntent = intent;
      }
      
      if (confidence > 0.2) {
        subIntents.push(intent);
      }
    }

    // Context-based intent refinement
    if (customerProfile) {
      // If customer has high purchase likelihood, bias toward purchase-related intents
      if (customerProfile.insights.likelihood_to_purchase > 0.7) {
        if (['product_inquiry', 'comparison'].includes(primaryIntent)) {
          maxConfidence = Math.min(1.0, maxConfidence * 1.2);
        }
      }
    }

    // Conversation history context
    const recentMessages = conversationMemory.shortTermMemory.slice(-3);
    if (recentMessages.some(m => m.key.includes('comparison'))) {
      if (primaryIntent === 'product_inquiry') {
        primaryIntent = 'comparison';
        maxConfidence = Math.min(1.0, maxConfidence * 1.1);
      }
    }

    // Emotional context analysis
    const emotionalIndicators = {
      frustrated: ['confused', 'frustrated', 'complicated', "don't understand"],
      excited: ['awesome', 'perfect', 'amazing', 'love it', 'exactly'],
      urgent: ['quickly', 'urgent', 'asap', 'immediately', 'need now']
    };

    let emotionalContext = 'neutral';
    for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
      if (indicators.some(indicator => input.includes(indicator))) {
        emotionalContext = emotion;
        break;
      }
    }

    // Urgency detection
    const urgencyKeywords = ['urgent', 'quickly', 'asap', 'immediately', 'need now', 'buying today'];
    const urgency = urgencyKeywords.some(keyword => input.includes(keyword)) ? 'high' : 
                   ['recommend', 'compare', 'buy'].some(keyword => input.includes(keyword)) ? 'medium' : 'low';

    return {
      primaryIntent,
      confidence: maxConfidence,
      subIntents,
      emotionalContext,
      urgency
    };
  }

  private async selectBestAction(
    context: DecisionContext,
    intentAnalysis: any,
    customerProfile: CustomerProfile | null,
    conversationMemory: ConversationMemory
  ): Promise<DecisionResult> {
    const { primaryIntent, confidence, urgency, emotionalContext } = intentAnalysis;

    // High-confidence, simple intents can be handled directly
    if (confidence > 0.8 && ['greeting', 'simple_inquiry'].includes(primaryIntent)) {
      return {
        action: 'direct_response',
        confidence,
        reasoning: 'High-confidence simple intent detected',
        response: await this.generateDirectResponse(context, intentAnalysis, customerProfile)
      };
    }

    // Complex product recommendations require workflow
    if (['recommendation', 'comparison'].includes(primaryIntent) && confidence > 0.6) {
      const planningContext: PlanningContext = {
        userIntent: context.userInput,
        currentContext: {
          sessionId: context.sessionId,
          customerId: context.customerId,
          phoneQuery: context.userInput
        },
        customerProfile: customerProfile ? {
          preferences: customerProfile.preferences,
          insights: customerProfile.insights
        } : undefined,
        availableTools: this.tools.getAllTools().map(t => t.name),
        constraints: {
          maxTasks: 5,
          maxDuration: 10
        }
      };

      await this.updateAgentState(context.sessionId, 'planning');
      const workflow = await this.planner.planWorkflow(planningContext);

      return {
        action: 'execute_workflow',
        confidence: confidence * 0.9,
        reasoning: `Complex ${primaryIntent} request requires multi-step workflow`,
        workflowId: workflow.id
      };
    }

    // Single tool execution for specific queries
    if (['price_inquiry', 'product_inquiry'].includes(primaryIntent) && confidence > 0.5) {
      const toolName = primaryIntent === 'price_inquiry' ? 'price_comparison' : 'phone_database_search';
      
      return {
        action: 'use_tool',
        confidence: confidence * 0.8,
        reasoning: `Single tool execution appropriate for ${primaryIntent}`,
        toolName,
        toolParameters: {
          query: context.userInput,
          customer_context: customerProfile?.preferences || {}
        }
      };
    }

    // Information gathering for unclear intents
    if (confidence < 0.5) {
      return {
        action: 'clarify',
        confidence: 0.7,
        reasoning: 'Intent unclear, need clarification',
        followUpQuestions: this.generateClarifyingQuestions(context, intentAnalysis),
        response: "I want to make sure I understand exactly what you're looking for! Could you help me with a bit more detail?"
      };
    }

    // Fallback to direct response
    return {
      action: 'direct_response',
      confidence: confidence * 0.6,
      reasoning: 'Fallback to direct response',
      response: await this.generateDirectResponse(context, intentAnalysis, customerProfile)
    };
  }

  private async generateDirectResponse(
    context: DecisionContext,
    intentAnalysis: any,
    customerProfile: CustomerProfile | null
  ): Promise<string> {
    const { primaryIntent, emotionalContext } = intentAnalysis;
    const customerName = customerProfile?.firstName || '';

    const responses = {
      greeting: [
        `Hey there${customerName ? ` ${customerName}` : ''}! 👋 I'm Jad, and I'm super excited to help you find the perfect phone! What brings you here today?`,
        `Hello${customerName ? ` ${customerName}` : ''}! 🌟 Welcome back! I'm Jad, your friendly phone expert. Ready to discover some amazing devices?`,
        `Hi there! 😊 I'm Jad, and I absolutely love helping people find their dream phone. What can I help you with today?`
      ],
      general_inquiry: [
        "Great question! I'm here to help with anything phone-related. Whether you want recommendations, comparisons, or just want to chat about the latest tech - I'm your guy! 📱✨",
        "I'd love to help you with that! As your personal phone expert, I can assist with recommendations, price comparisons, feature explanations, and more. What specifically interests you?",
        "That's exactly what I'm here for! I'm passionate about helping people navigate the world of mobile phones. Let me know what you'd like to explore! 🚀"
      ]
    };

    const responseList = responses[primaryIntent as keyof typeof responses] || responses.general_inquiry;
    
    // Add emotional context consideration
    if (emotionalContext === 'frustrated') {
      return "I totally understand how overwhelming phone shopping can be! 😊 Don't worry - I'm here to make it super simple and fun. Let's take it one step at a time!";
    }
    
    if (emotionalContext === 'excited') {
      return "I love your enthusiasm! 🎉 There are so many amazing phones out there, and I can't wait to help you find the perfect match. Let's dive in!";
    }

    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private generateClarifyingQuestions(
    context: DecisionContext,
    intentAnalysis: any
  ): string[] {
    const questions = [
      "What type of phone are you most interested in?",
      "Are you looking for a specific brand or open to suggestions?",
      "What's your budget range?",
      "What do you primarily use your phone for?"
    ];

    // Customize based on context
    if (context.userInput.includes('camera')) {
      questions.unshift("Are you looking for the best camera phone for photography or video?");
    }
    
    if (context.userInput.includes('gaming')) {
      questions.unshift("Are you looking for a phone optimized for gaming performance?");
    }

    return questions.slice(0, 3);
  }

  // Agent State Management
  private async updateAgentState(sessionId: string, mode: AgentState['currentMode']): Promise<void> {
    let state = this.agentStates.get(sessionId);
    
    if (!state) {
      state = {
        sessionId,
        currentMode: 'listening',
        activeWorkflows: [],
        contextualAwareness: {
          purchaseIntent: 'browsing',
          conversationStage: 'greeting'
        },
        performanceMetrics: {
          responseTime: 0,
          accuracy: 0.8,
          customerSatisfaction: 0.8
        }
      };
    }
    
    state.currentMode = mode;
    this.agentStates.set(sessionId, state);
  }

  private async updatePerformanceMetrics(
    sessionId: string, 
    responseTime: number, 
    confidence: number
  ): Promise<void> {
    const state = this.agentStates.get(sessionId);
    if (state) {
      state.performanceMetrics.responseTime = responseTime;
      state.performanceMetrics.accuracy = (state.performanceMetrics.accuracy + confidence) / 2;
      this.agentStates.set(sessionId, state);
    }
  }

  private async storeDecisionContext(
    context: DecisionContext,
    decision: DecisionResult
  ): Promise<void> {
    // Store decision for learning and improvement
    await this.memory.addToShortTermMemory(
      context.sessionId,
      'decision_context',
      {
        input: context.userInput,
        decision: decision.action,
        confidence: decision.confidence,
        reasoning: decision.reasoning
      },
      8 // High importance for learning
    );
  }

  // Workflow Execution Interface
  async executeWorkflow(workflowId: string): Promise<{
    success: boolean;
    result?: unknown;
    error?: string;
  }> {
    try {
      await this.updateAgentState('workflow_' + workflowId, 'executing');
      
      const workflow = await this.planner.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Execute tasks in dependency order
      const executableTasks = await this.planner.getNextExecutableTasks(workflowId);
      
      for (const task of executableTasks) {
        await this.planner.updateTaskStatus(workflowId, task.id, 'in_progress');
        
        try {
          const toolResult = await this.tools.executeTool(task.tool, task.parameters);
          
          if (toolResult.success) {
            await this.planner.updateTaskStatus(workflowId, task.id, 'completed', toolResult.data);
          } else {
            await this.planner.updateTaskStatus(workflowId, task.id, 'failed', undefined, toolResult.error);
          }
        } catch (error) {
          await this.planner.updateTaskStatus(
            workflowId, 
            task.id, 
            'failed', 
            undefined, 
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      const updatedWorkflow = await this.planner.getWorkflow(workflowId);
      
      return {
        success: updatedWorkflow?.status === 'completed',
        result: updatedWorkflow
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow execution failed'
      };
    }
  }

  // Public API Methods
  async getAgentState(sessionId: string): Promise<AgentState | null> {
    return this.agentStates.get(sessionId) || null;
  }

  async getActiveWorkflows(sessionId: string): Promise<Workflow[]> {
    const state = this.agentStates.get(sessionId);
    if (!state || state.activeWorkflows.length === 0) return [];

    const workflows = [];
    for (const workflowId of state.activeWorkflows) {
      const workflow = await this.planner.getWorkflow(workflowId);
      if (workflow) workflows.push(workflow);
    }
    
    return workflows;
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    await this.planner.cancelWorkflow(workflowId);
    
    // Remove from all active states
    for (const [sessionId, state] of this.agentStates) {
      const index = state.activeWorkflows.indexOf(workflowId);
      if (index > -1) {
        state.activeWorkflows.splice(index, 1);
        this.agentStates.set(sessionId, state);
      }
    }
  }
}

// Global instance
let jadEngine: JadContextualEngine | null = null;

export function getJadEngine(): JadContextualEngine {
  if (!jadEngine) {
    jadEngine = new JadContextualEngine();
  }
  return jadEngine;
}