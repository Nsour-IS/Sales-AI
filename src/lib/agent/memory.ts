// Agentic Jad - Memory System
// Provides persistent memory, customer profiling, and contextual awareness

export interface CustomerProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  
  // Behavioral Profile
  preferences: {
    budget_range: 'low' | 'mid' | 'high' | '';
    primary_use: 'photography' | 'gaming' | 'business' | 'daily_use' | '';
    brand_loyalty: string[];
    feature_priorities: string[];
    price_sensitivity: 'low' | 'medium' | 'high';
    tech_savviness: 'beginner' | 'intermediate' | 'advanced';
  };
  
  // Purchase History
  purchaseHistory: {
    date: string;
    product: string;
    brand: string;
    price: number;
    satisfaction: number; // 1-10
    feedback?: string;
  }[];
  
  // Interaction History
  interactions: {
    timestamp: string;
    type: 'chat' | 'comparison' | 'scan' | 'purchase';
    context: Record<string, unknown>;
    outcome?: string;
  }[];
  
  // Derived Insights
  insights: {
    persona: 'budget_conscious' | 'feature_seeker' | 'brand_loyalist' | 'early_adopter';
    likelihood_to_purchase: number; // 0-1
    preferred_communication_style: 'formal' | 'casual' | 'technical';
    decision_timeline: 'immediate' | 'researching' | 'long_term';
  };
  
  created_at: string;
  updated_at: string;
}

export interface ConversationMemory {
  sessionId: string;
  customerId?: string;
  
  // Current Context
  currentIntent: string;
  activePhones: string[]; // Phone IDs being discussed
  comparisonMatrix?: string[][]; // Active comparisons
  
  // Memory Stack
  shortTermMemory: {
    key: string;
    value: unknown;
    timestamp: string;
    importance: number; // 1-10
  }[];
  
  longTermMemory: {
    pattern: string;
    frequency: number;
    lastSeen: string;
    context: Record<string, unknown>;
  }[];
  
  // Task Context
  currentTasks: {
    id: string;
    type: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    steps: string[];
    currentStep: number;
    context: Record<string, unknown>;
  }[];
}

export class JadMemorySystem {
  private customerProfiles: Map<string, CustomerProfile> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private globalInsights: Map<string, unknown> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // Customer Profile Management
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    const profile = this.customerProfiles.get(customerId);
    if (profile) {
      return { ...profile };
    }
    
    // Try to load from persistent storage
    return this.loadCustomerFromStorage(customerId);
  }

  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<void> {
    let profile = this.customerProfiles.get(customerId) || this.createNewCustomerProfile(customerId);
    
    profile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    this.customerProfiles.set(customerId, profile);
    await this.saveCustomerToStorage(customerId, profile);
    
    // Update insights based on new data
    await this.updateCustomerInsights(customerId);
  }

  private createNewCustomerProfile(customerId: string): CustomerProfile {
    return {
      id: customerId,
      preferences: {
        budget_range: '',
        primary_use: '',
        brand_loyalty: [],
        feature_priorities: [],
        price_sensitivity: 'medium',
        tech_savviness: 'intermediate'
      },
      purchaseHistory: [],
      interactions: [],
      insights: {
        persona: 'feature_seeker',
        likelihood_to_purchase: 0.5,
        preferred_communication_style: 'casual',
        decision_timeline: 'researching'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Conversation Memory Management
  async getConversationMemory(sessionId: string): Promise<ConversationMemory> {
    let memory = this.conversationMemories.get(sessionId);
    
    if (!memory) {
      memory = this.createNewConversationMemory(sessionId);
      this.conversationMemories.set(sessionId, memory);
    }
    
    return { ...memory };
  }

  async updateConversationMemory(sessionId: string, updates: Partial<ConversationMemory>): Promise<void> {
    let memory = this.conversationMemories.get(sessionId) || this.createNewConversationMemory(sessionId);
    
    memory = {
      ...memory,
      ...updates
    };
    
    this.conversationMemories.set(sessionId, memory);
    await this.saveConversationToStorage(sessionId, memory);
  }

  private createNewConversationMemory(sessionId: string): ConversationMemory {
    return {
      sessionId,
      currentIntent: 'greeting',
      activePhones: [],
      shortTermMemory: [],
      longTermMemory: [],
      currentTasks: []
    };
  }

  // Memory Operations
  async addToShortTermMemory(sessionId: string, key: string, value: unknown, importance: number = 5): Promise<void> {
    const memory = await this.getConversationMemory(sessionId);
    
    memory.shortTermMemory.push({
      key,
      value,
      timestamp: new Date().toISOString(),
      importance
    });
    
    // Keep only the most important recent memories (max 20)
    memory.shortTermMemory = memory.shortTermMemory
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 20);
    
    await this.updateConversationMemory(sessionId, memory);
  }

  async promoteToLongTermMemory(sessionId: string, pattern: string, context: Record<string, unknown>): Promise<void> {
    const memory = await this.getConversationMemory(sessionId);
    
    const existingPattern = memory.longTermMemory.find(ltm => ltm.pattern === pattern);
    
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.lastSeen = new Date().toISOString();
      existingPattern.context = { ...existingPattern.context, ...context };
    } else {
      memory.longTermMemory.push({
        pattern,
        frequency: 1,
        lastSeen: new Date().toISOString(),
        context
      });
    }
    
    await this.updateConversationMemory(sessionId, memory);
  }

  // Insight Generation
  private async updateCustomerInsights(customerId: string): Promise<void> {
    const profile = await this.getCustomerProfile(customerId);
    if (!profile) return;

    const insights = { ...profile.insights };
    
    // Determine persona
    if (profile.preferences.price_sensitivity === 'high') {
      insights.persona = 'budget_conscious';
    } else if (profile.preferences.brand_loyalty.length > 0) {
      insights.persona = 'brand_loyalist';
    } else if (profile.preferences.tech_savviness === 'advanced') {
      insights.persona = 'early_adopter';
    } else {
      insights.persona = 'feature_seeker';
    }
    
    // Calculate purchase likelihood based on interactions
    const recentInteractions = profile.interactions.filter(i => 
      new Date(i.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    const chatInteractions = recentInteractions.filter(i => i.type === 'chat').length;
    const comparisonInteractions = recentInteractions.filter(i => i.type === 'comparison').length;
    
    insights.likelihood_to_purchase = Math.min(0.95, 
      0.3 + (chatInteractions * 0.1) + (comparisonInteractions * 0.2)
    );
    
    await this.updateCustomerProfile(customerId, { insights });
  }

  // Storage Operations
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const customerData = localStorage.getItem('jad_customer_profiles');
      if (customerData) {
        const profiles = JSON.parse(customerData);
        this.customerProfiles = new Map(Object.entries(profiles));
      }
      
      const conversationData = localStorage.getItem('jad_conversation_memories');
      if (conversationData) {
        const memories = JSON.parse(conversationData);
        this.conversationMemories = new Map(Object.entries(memories));
      }
    } catch (error) {
      console.warn('Failed to load Jad memory from storage:', error);
    }
  }

  private async saveCustomerToStorage(customerId: string, profile: CustomerProfile): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const allProfiles = Object.fromEntries(this.customerProfiles);
      localStorage.setItem('jad_customer_profiles', JSON.stringify(allProfiles));
    } catch (error) {
      console.warn('Failed to save customer profile:', error);
    }
  }

  private async saveConversationToStorage(sessionId: string, memory: ConversationMemory): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const allMemories = Object.fromEntries(this.conversationMemories);
      localStorage.setItem('jad_conversation_memories', JSON.stringify(allMemories));
    } catch (error) {
      console.warn('Failed to save conversation memory:', error);
    }
  }

  private async loadCustomerFromStorage(customerId: string): Promise<CustomerProfile | null> {
    // In production, this would query your database
    return null;
  }

  // Context-Aware Queries
  async getRelevantMemories(sessionId: string, query: string, limit: number = 5): Promise<unknown[]> {
    const memory = await this.getConversationMemory(sessionId);
    
    // Simple keyword matching - in production, use embeddings/vector search
    const queryWords = query.toLowerCase().split(' ');
    
    const relevantMemories = memory.shortTermMemory
      .filter(stm => {
        const memoryStr = JSON.stringify(stm.value).toLowerCase();
        return queryWords.some(word => memoryStr.includes(word));
      })
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit)
      .map(stm => stm.value);
    
    return relevantMemories;
  }
}

// Global instance
let jadMemory: JadMemorySystem | null = null;

export function getJadMemory(): JadMemorySystem {
  if (!jadMemory) {
    jadMemory = new JadMemorySystem();
  }
  return jadMemory;
}