// Agentic Jad - Tool Integration Framework
// Enables Jad to use external APIs, services, and perform actions

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
    enum?: string[];
  }>;
  category: 'database' | 'api' | 'action' | 'calculation' | 'communication';
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: Record<string, unknown>;
  abstract category: string;

  abstract execute(params: Record<string, unknown>): Promise<ToolResult>;
}

// Database Tools
export class PhoneDatabaseTool extends BaseTool {
  name = 'phone_database_search';
  description = 'Search and filter mobile phones in the database';
  category = 'database';
  parameters = {
    query: { type: 'string', description: 'Search query for phones' },
    brand: { type: 'string', description: 'Filter by brand' },
    price_range: { type: 'string', enum: ['low', 'mid', 'high'], description: 'Price range filter' },
    features: { type: 'array', description: 'Required features' },
    limit: { type: 'number', description: 'Maximum results to return' }
  };

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    try {
      const response = await fetch('/api/phones/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      
      return {
        success: true,
        data: data.phones || [],
        metadata: { total: data.total, filters_applied: params }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database search failed'
      };
    }
  }
}

export class PriceComparisonTool extends BaseTool {
  name = 'price_comparison';
  description = 'Compare prices across multiple retailers';
  category = 'api';
  parameters = {
    phone_model: { type: 'string', description: 'Phone model to search for', required: true },
    retailers: { type: 'array', description: 'List of retailers to check' }
  };

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    try {
      // Simulate price comparison API call
      const phoneModel = params.phone_model as string;
      const retailers = (params.retailers as string[]) || ['Best Buy', 'Amazon', 'Apple Store', 'Carrier Direct'];
      
      const priceData = retailers.map(retailer => ({
        retailer,
        price: Math.floor(Math.random() * 500) + 200, // Mock prices
        availability: Math.random() > 0.2 ? 'in_stock' : 'out_of_stock',
        shipping: Math.random() > 0.5 ? 'free' : 'paid',
        rating: Math.floor(Math.random() * 5) + 1
      }));

      return {
        success: true,
        data: {
          phone_model: phoneModel,
          prices: priceData.sort((a, b) => a.price - b.price),
          best_deal: priceData.reduce((min, current) => 
            current.availability === 'in_stock' && current.price < min.price ? current : min
          )
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Price comparison failed'
      };
    }
  }
}

export class ReviewAnalysisTool extends BaseTool {
  name = 'review_analysis';
  description = 'Analyze customer reviews and ratings for phones';
  category = 'api';
  parameters = {
    phone_id: { type: 'string', description: 'Phone ID to analyze', required: true },
    sentiment_analysis: { type: 'boolean', description: 'Include sentiment analysis' }
  };

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    try {
      // Mock review analysis
      const phoneId = params.phone_id as string;
      
      const mockAnalysis = {
        overall_rating: Math.random() * 2 + 3, // 3-5 range
        total_reviews: Math.floor(Math.random() * 5000) + 100,
        sentiment: {
          positive: Math.random() * 0.4 + 0.4, // 40-80%
          neutral: Math.random() * 0.3 + 0.1,  // 10-40%
          negative: Math.random() * 0.2 + 0.05  // 5-25%
        },
        key_topics: [
          { topic: 'camera_quality', sentiment: 'positive', mentions: 234 },
          { topic: 'battery_life', sentiment: 'mixed', mentions: 189 },
          { topic: 'build_quality', sentiment: 'positive', mentions: 156 },
          { topic: 'performance', sentiment: 'positive', mentions: 298 }
        ],
        pros: ['Great camera', 'Fast performance', 'Nice design'],
        cons: ['Expensive', 'Battery could be better', 'No headphone jack']
      };

      return {
        success: true,
        data: mockAnalysis,
        metadata: { phone_id: phoneId, analysis_date: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Review analysis failed'
      };
    }
  }
}

export class RecommendationEngine extends BaseTool {
  name = 'generate_recommendations';
  description = 'Generate personalized phone recommendations based on customer profile';
  category = 'calculation';
  parameters = {
    customer_profile: { type: 'object', description: 'Customer profile data', required: true },
    budget: { type: 'number', description: 'Budget constraint' },
    current_phone: { type: 'string', description: 'Current phone for upgrade path' }
  };

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    try {
      // Get all available phones
      const phoneTool = new PhoneDatabaseTool();
      const phoneResult = await phoneTool.execute({ limit: 50 });
      
      if (!phoneResult.success) {
        throw new Error('Failed to fetch phones for recommendations');
      }

      const phones = phoneResult.data as unknown[];
      const customerProfile = params.customer_profile as Record<string, unknown>;
      
      // Simple recommendation scoring (in production, use ML models)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recommendations = phones.map((phone: any) => ({
        ...phone,
        score: this.calculateRecommendationScore(phone, customerProfile),
        reasons: this.generateRecommendationReasons(phone, customerProfile)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

      return {
        success: true,
        data: {
          recommendations,
          algorithm: 'profile_based_scoring',
          confidence: 0.85
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Recommendation generation failed'
      };
    }
  }

  private calculateRecommendationScore(phone: unknown, profile: unknown): number {
    let score = 0.5; // Base score
    
    // Budget matching
    if (profile.preferences?.budget_range === phone.price_range) {
      score += 0.3;
    }
    
    // Use case matching
    if (profile.preferences?.primary_use && phone.target_audience?.includes(profile.preferences.primary_use)) {
      score += 0.2;
    }
    
    // Brand loyalty
    if (profile.preferences?.brand_loyalty?.includes(phone.brands?.name)) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  private generateRecommendationReasons(phone: unknown, profile: unknown): string[] {
    const reasons = [];
    
    if (profile.preferences?.budget_range === phone.price_range) {
      reasons.push(`Perfect fit for your ${phone.price_range} budget`);
    }
    
    if (profile.preferences?.primary_use === 'photography' && phone.key_features?.includes('Pro Camera')) {
      reasons.push('Excellent camera system for photography');
    }
    
    if (profile.preferences?.primary_use === 'gaming' && phone.target_audience?.includes('gamers')) {
      reasons.push('Optimized for gaming performance');
    }
    
    return reasons;
  }
}

export class NotificationTool extends BaseTool {
  name = 'send_notification';
  description = 'Send notifications to customers (email, SMS, push)';
  category = 'communication';
  parameters = {
    customer_id: { type: 'string', description: 'Customer ID', required: true },
    type: { type: 'string', enum: ['email', 'sms', 'push'], description: 'Notification type', required: true },
    message: { type: 'string', description: 'Message content', required: true },
    subject: { type: 'string', description: 'Subject line (for email)' }
  };

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    try {
      // Mock notification sending
      const customerId = params.customer_id as string;
      const type = params.type as string;
      const message = params.message as string;
      
      console.log(`📧 Sending ${type} notification to ${customerId}: ${message}`);
      
      return {
        success: true,
        data: {
          notification_id: `notif_${Date.now()}`,
          status: 'sent',
          delivered_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Notification failed'
      };
    }
  }
}

// Tool Registry
export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    const defaultTools = [
      new PhoneDatabaseTool(),
      new PriceComparisonTool(),
      new ReviewAnalysisTool(),
      new RecommendationEngine(),
      new NotificationTool()
    ];

    defaultTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  registerTool(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): BaseTool | null {
    return this.tools.get(name) || null;
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters as Record<string, unknown>,
      category: tool.category as ToolDefinition['category']
    }));
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.getTool(name);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found`
      };
    }

    try {
      return await tool.execute(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed'
      };
    }
  }
}

// Global instance
let jadTools: ToolRegistry | null = null;

export function getJadTools(): ToolRegistry {
  if (!jadTools) {
    jadTools = new ToolRegistry();
  }
  return jadTools;
}