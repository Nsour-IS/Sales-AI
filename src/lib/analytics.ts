// Sales AI Analytics and Usage Tracking

export interface AnalyticsEvent {
  event_name: string;
  timestamp: string;
  session_id: string;
  user_agent: string;
  page_url: string;
  properties: Record<string, string | number | boolean | undefined>;
}

export interface SessionData {
  session_id: string;
  start_time: string;
  user_agent: string;
  initial_url: string;
  events_count: number;
  duration_seconds?: number;
}

class AnalyticsManager {
  private sessionId: string;
  private sessionStartTime: string;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date().toISOString();
    
    // Initialize session
    this.initializeSession();
    
    // Track page visibility changes
    this.setupVisibilityTracking();
    
    // Auto-flush events periodically
    this.setupAutoFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private initializeSession() {
    const sessionData: SessionData = {
      session_id: this.sessionId,
      start_time: this.sessionStartTime,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      initial_url: typeof window !== 'undefined' ? window.location.href : '',
      events_count: 0
    };

    // Store session data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sales_ai_session', JSON.stringify(sessionData));
    }

    // Track session start
    this.track('session_start', {
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  private setupVisibilityTracking() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_hidden');
        } else {
          this.track('page_visible');
        }
      });
    }
  }

  private setupAutoFlush() {
    // Flush events every 30 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.flushEvents();
      }, 30000);

      // Flush on page unload
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });
    }
  }

  public track(eventName: string, properties: Record<string, string | number | boolean | undefined> = {}) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event_name: eventName,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      properties: {
        ...properties,
        session_duration: this.getSessionDuration()
      }
    };

    this.events.push(event);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      const storedEvents = JSON.parse(localStorage.getItem('sales_ai_events') || '[]');
      storedEvents.push(event);
      localStorage.setItem('sales_ai_events', JSON.stringify(storedEvents.slice(-100))); // Keep last 100 events
    }

    // Update session event count
    this.updateSessionData();
  }

  private updateSessionData() {
    if (typeof window !== 'undefined') {
      const sessionData = JSON.parse(localStorage.getItem('sales_ai_session') || '{}');
      sessionData.events_count = this.events.length;
      sessionData.duration_seconds = this.getSessionDuration();
      localStorage.setItem('sales_ai_session', JSON.stringify(sessionData));
    }
  }

  private getSessionDuration(): number {
    const startTime = new Date(this.sessionStartTime).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - startTime) / 1000);
  }

  public async flushEvents() {
    if (this.events.length === 0) return;

    try {
      // Send events to analytics API
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          events: this.events
        }),
      });

      // Clear sent events
      this.events = [];
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
    }
  }

  private endSession() {
    this.track('session_end', {
      session_duration: this.getSessionDuration(),
      total_events: this.events.length
    });

    this.flushEvents();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public disable() {
    this.isEnabled = false;
  }

  public enable() {
    this.isEnabled = true;
  }

  // Get analytics data for dashboard
  public getLocalAnalytics() {
    if (typeof window === 'undefined') return null;

    const events = JSON.parse(localStorage.getItem('sales_ai_events') || '[]');
    const session = JSON.parse(localStorage.getItem('sales_ai_session') || '{}');

    return {
      session,
      events,
      summary: this.generateLocalSummary(events)
    };
  }

  private generateLocalSummary(events: AnalyticsEvent[]) {
    const eventCounts: Record<string, number> = {};
    let totalInteractions = 0;

    events.forEach(event => {
      eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
      if (!event.event_name.includes('session') && !event.event_name.includes('page')) {
        totalInteractions++;
      }
    });

    return {
      total_events: events.length,
      total_interactions: totalInteractions,
      event_counts: eventCounts,
      session_duration: this.getSessionDuration()
    };
  }
}

// Create global analytics instance
let analytics: AnalyticsManager | null = null;

export function getAnalytics(): AnalyticsManager {
  if (!analytics) {
    analytics = new AnalyticsManager();
  }
  return analytics;
}

// Convenience functions for tracking specific events
export const trackEvent = (eventName: string, properties?: Record<string, string | number | boolean | undefined>) => {
  getAnalytics().track(eventName, properties);
};

export const trackCameraUsage = (action: string, properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent(`camera_${action}`, properties);
};

export const trackChatInteraction = (action: string, properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent(`chat_${action}`, properties);
};

export const trackProductComparison = (action: string, properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent(`comparison_${action}`, properties);
};

export const trackPreferences = (action: string, properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent(`preferences_${action}`, properties);
};

export const trackPhoneRecognition = (success: boolean, properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent('phone_recognition', { success, ...properties });
};

export const trackAIRecommendation = (properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent('ai_recommendation', properties);
};

export const trackPersonalityInteraction = (interactionType: string, properties?: Record<string, string | number | boolean | undefined>) => {
  trackEvent(`jad_personality_${interactionType}`, properties);
};