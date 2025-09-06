// Agentic Jad - Multi-Step Task Planner
// Plans and orchestrates complex multi-step workflows

export interface Task {
  id: string;
  type: string;
  description: string;
  priority: number; // 1-10, higher is more important
  dependencies: string[]; // Task IDs this depends on
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  
  // Execution details
  tool: string;
  parameters: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  
  // Timing
  estimatedDuration: number; // minutes
  scheduledFor?: string; // ISO timestamp
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  // Results
  result?: unknown;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  customerId?: string;
  sessionId: string;
  
  // Workflow state
  status: 'created' | 'planning' | 'executing' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  totalSteps: number;
  
  // Tasks
  tasks: Task[];
  taskDependencyGraph: Map<string, string[]>;
  
  // Context
  context: Record<string, unknown>;
  goal: string;
  success_criteria: string[];
  
  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
}

export interface PlanningContext {
  userIntent: string;
  currentContext: Record<string, unknown>;
  customerProfile?: Record<string, unknown>;
  availableTools: string[];
  constraints: {
    maxTasks: number;
    maxDuration: number; // minutes
    budget?: number;
  };
}

export class JadTaskPlanner {
  private workflows: Map<string, Workflow> = new Map();
  private executingTasks: Map<string, Task> = new Map();

  // Main planning method
  async planWorkflow(context: PlanningContext): Promise<Workflow> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: Workflow = {
      id: workflowId,
      name: this.generateWorkflowName(context.userIntent),
      description: context.userIntent,
      sessionId: (context.currentContext.sessionId as string) || 'unknown',
      customerId: context.currentContext.customerId as string,
      status: 'planning',
      currentStep: 0,
      totalSteps: 0,
      tasks: [],
      taskDependencyGraph: new Map(),
      context: context.currentContext,
      goal: context.userIntent,
      success_criteria: this.generateSuccessCriteria(context.userIntent),
      createdAt: new Date().toISOString()
    };

    // Generate task plan based on intent
    const tasks = await this.generateTaskPlan(context);
    
    workflow.tasks = tasks;
    workflow.totalSteps = tasks.length;
    workflow.taskDependencyGraph = this.buildDependencyGraph(tasks);
    workflow.status = 'created';
    
    // Store workflow
    this.workflows.set(workflowId, workflow);
    
    return workflow;
  }

  private async generateTaskPlan(context: PlanningContext): Promise<Task[]> {
    const intent = context.userIntent.toLowerCase();
    const tasks: Task[] = [];
    
    // Phone Recommendation Workflow
    if (intent.includes('recommend') || intent.includes('suggest') || intent.includes('find phone')) {
      tasks.push(...this.createRecommendationTasks(context));
    }
    
    // Price Comparison Workflow
    else if (intent.includes('price') || intent.includes('compare cost')) {
      tasks.push(...this.createPriceComparisonTasks(context));
    }
    
    // Detailed Analysis Workflow
    else if (intent.includes('analyze') || intent.includes('review') || intent.includes('pros and cons')) {
      tasks.push(...this.createAnalysisTasks(context));
    }
    
    // Purchase Journey Workflow
    else if (intent.includes('buy') || intent.includes('purchase') || intent.includes('order')) {
      tasks.push(...this.createPurchaseJourneyTasks(context));
    }
    
    // Upgrade Path Workflow
    else if (intent.includes('upgrade') || intent.includes('switch') || intent.includes('new phone')) {
      tasks.push(...this.createUpgradePathTasks(context));
    }
    
    // Default: General Information Gathering
    else {
      tasks.push(...this.createInformationGatheringTasks(context));
    }
    
    return tasks.slice(0, context.constraints.maxTasks);
  }

  private createRecommendationTasks(context: PlanningContext): Task[] {
    const baseTaskId = Date.now();
    
    return [
      {
        id: `task_${baseTaskId + 1}`,
        type: 'data_gathering',
        description: 'Gather customer preferences and requirements',
        priority: 9,
        dependencies: [],
        status: 'pending',
        tool: 'customer_profile_analysis',
        parameters: {
          customer_id: context.currentContext.customerId,
          session_context: context.currentContext
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 2}`,
        type: 'database_search',
        description: 'Search phone database based on requirements',
        priority: 8,
        dependencies: [`task_${baseTaskId + 1}`],
        status: 'pending',
        tool: 'phone_database_search',
        parameters: {
          // Will be populated based on previous task results
        },
        retryCount: 0,
        maxRetries: 3,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 3}`,
        type: 'recommendation',
        description: 'Generate personalized recommendations',
        priority: 9,
        dependencies: [`task_${baseTaskId + 1}`, `task_${baseTaskId + 2}`],
        status: 'pending',
        tool: 'generate_recommendations',
        parameters: {
          // Will be populated from dependencies
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 4}`,
        type: 'enhancement',
        description: 'Add review analysis and pricing info',
        priority: 6,
        dependencies: [`task_${baseTaskId + 3}`],
        status: 'pending',
        tool: 'review_analysis',
        parameters: {
          // Will be populated with recommended phone IDs
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      }
    ];
  }

  private createPriceComparisonTasks(context: PlanningContext): Task[] {
    const baseTaskId = Date.now();
    
    return [
      {
        id: `task_${baseTaskId + 1}`,
        type: 'phone_identification',
        description: 'Identify phones to compare prices for',
        priority: 8,
        dependencies: [],
        status: 'pending',
        tool: 'phone_database_search',
        parameters: {
          query: context.currentContext.phoneQuery || 'latest phones'
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 2}`,
        type: 'price_comparison',
        description: 'Compare prices across retailers',
        priority: 9,
        dependencies: [`task_${baseTaskId + 1}`],
        status: 'pending',
        tool: 'price_comparison',
        parameters: {
          // Will be populated with phone models
        },
        retryCount: 0,
        maxRetries: 3,
        estimatedDuration: 3,
        createdAt: new Date().toISOString()
      }
    ];
  }

  private createAnalysisTasks(context: PlanningContext): Task[] {
    const baseTaskId = Date.now();
    
    return [
      {
        id: `task_${baseTaskId + 1}`,
        type: 'phone_identification',
        description: 'Identify phone to analyze',
        priority: 8,
        dependencies: [],
        status: 'pending',
        tool: 'phone_database_search',
        parameters: {
          query: context.currentContext.phoneQuery
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 2}`,
        type: 'review_analysis',
        description: 'Analyze customer reviews and sentiment',
        priority: 7,
        dependencies: [`task_${baseTaskId + 1}`],
        status: 'pending',
        tool: 'review_analysis',
        parameters: {
          sentiment_analysis: true
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 4,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 3}`,
        type: 'price_analysis',
        description: 'Analyze pricing and value proposition',
        priority: 6,
        dependencies: [`task_${baseTaskId + 1}`],
        status: 'pending',
        tool: 'price_comparison',
        parameters: {},
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      }
    ];
  }

  private createPurchaseJourneyTasks(context: PlanningContext): Task[] {
    const baseTaskId = Date.now();
    
    return [
      {
        id: `task_${baseTaskId + 1}`,
        type: 'final_recommendation',
        description: 'Confirm final phone choice',
        priority: 9,
        dependencies: [],
        status: 'pending',
        tool: 'generate_recommendations',
        parameters: {
          customer_profile: context.customerProfile,
          final_selection: true
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 2}`,
        type: 'retailer_search',
        description: 'Find best purchase options',
        priority: 8,
        dependencies: [`task_${baseTaskId + 1}`],
        status: 'pending',
        tool: 'price_comparison',
        parameters: {},
        retryCount: 0,
        maxRetries: 3,
        estimatedDuration: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 3}`,
        type: 'purchase_assistance',
        description: 'Provide purchase guidance and next steps',
        priority: 7,
        dependencies: [`task_${baseTaskId + 2}`],
        status: 'pending',
        tool: 'send_notification',
        parameters: {
          type: 'purchase_guidance'
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 1,
        createdAt: new Date().toISOString()
      }
    ];
  }

  private createUpgradePathTasks(context: PlanningContext): Task[] {
    const baseTaskId = Date.now();
    
    return [
      {
        id: `task_${baseTaskId + 1}`,
        type: 'current_phone_analysis',
        description: 'Analyze current phone capabilities',
        priority: 8,
        dependencies: [],
        status: 'pending',
        tool: 'phone_database_search',
        parameters: {
          query: context.currentContext.currentPhone || 'analyze upgrade'
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: `task_${baseTaskId + 2}`,
        type: 'upgrade_recommendations',
        description: 'Generate upgrade recommendations',
        priority: 9,
        dependencies: [`task_${baseTaskId + 1}`],
        status: 'pending',
        tool: 'generate_recommendations',
        parameters: {
          upgrade_analysis: true
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 3,
        createdAt: new Date().toISOString()
      }
    ];
  }

  private createInformationGatheringTasks(context: PlanningContext): Task[] {
    const baseTaskId = Date.now();
    
    return [
      {
        id: `task_${baseTaskId + 1}`,
        type: 'general_search',
        description: 'Search for relevant phone information',
        priority: 7,
        dependencies: [],
        status: 'pending',
        tool: 'phone_database_search',
        parameters: {
          query: context.userIntent
        },
        retryCount: 0,
        maxRetries: 2,
        estimatedDuration: 2,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Utility methods
  private generateWorkflowName(intent: string): string {
    const intentWords = intent.toLowerCase().split(' ').slice(0, 3);
    return intentWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Workflow';
  }

  private generateSuccessCriteria(intent: string): string[] {
    const criteria = ['User query addressed successfully'];
    
    if (intent.includes('recommend')) {
      criteria.push('Personalized recommendations provided');
    }
    if (intent.includes('compare')) {
      criteria.push('Comprehensive comparison completed');
    }
    if (intent.includes('analyze')) {
      criteria.push('Detailed analysis delivered');
    }
    if (intent.includes('price')) {
      criteria.push('Pricing information gathered');
    }
    
    return criteria;
  }

  private buildDependencyGraph(tasks: Task[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    tasks.forEach(task => {
      graph.set(task.id, task.dependencies);
    });
    
    return graph;
  }

  // Workflow execution methods
  async getNextExecutableTasks(workflowId: string): Promise<Task[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];
    
    return workflow.tasks.filter(task => {
      // Task must be pending
      if (task.status !== 'pending') return false;
      
      // All dependencies must be completed
      const allDepsCompleted = task.dependencies.every(depId => {
        const depTask = workflow.tasks.find(t => t.id === depId);
        return depTask && depTask.status === 'completed';
      });
      
      return allDepsCompleted;
    });
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  async updateTaskStatus(workflowId: string, taskId: string, status: Task['status'], result?: unknown, error?: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    const task = workflow.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = status;
    if (result !== undefined) task.result = result;
    if (error) task.error = error;
    
    if (status === 'in_progress' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if (['completed', 'failed', 'cancelled'].includes(status) && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    }
    
    // Update workflow status
    await this.updateWorkflowStatus(workflowId);
  }

  private async updateWorkflowStatus(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    const tasks = workflow.tasks;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    
    if (failedTasks > 0 && inProgressTasks === 0) {
      workflow.status = 'failed';
    } else if (completedTasks === tasks.length) {
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
    } else if (inProgressTasks > 0) {
      workflow.status = 'executing';
      if (!workflow.startedAt) {
        workflow.startedAt = new Date().toISOString();
      }
    }
    
    workflow.currentStep = completedTasks;
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;
    
    workflow.status = 'failed';
    workflow.tasks.forEach(task => {
      if (task.status === 'pending' || task.status === 'in_progress') {
        task.status = 'cancelled';
      }
    });
  }
}

// Global instance
let jadPlanner: JadTaskPlanner | null = null;

export function getJadPlanner(): JadTaskPlanner {
  if (!jadPlanner) {
    jadPlanner = new JadTaskPlanner();
  }
  return jadPlanner;
}