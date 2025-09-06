import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { session_id, events } = await request.json()
    
    if (!session_id || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid analytics data' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = await createClient()
    
    // Process and store analytics events
    const processedEvents = events.map(event => ({
      session_id,
      event_name: event.event_name,
      timestamp: event.timestamp,
      user_agent: event.user_agent,
      page_url: event.page_url,
      properties: event.properties || {},
      created_at: new Date().toISOString()
    }))

    // In a production environment, you would typically store this in your database
    // For now, we'll just log the analytics data and return success
    console.log('Analytics Events Received:', {
      session_id,
      event_count: events.length,
      events: processedEvents
    })

    // You could store analytics in Supabase like this:
    /*
    const { error } = await supabase
      .from('analytics_events')
      .insert(processedEvents)
    
    if (error) {
      console.error('Analytics storage error:', error)
      return NextResponse.json({ error: 'Failed to store analytics' }, { status: 500 })
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics events processed',
      events_received: events.length 
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const timeframe = searchParams.get('timeframe') || '24h'
    
    // Initialize Supabase client
    const supabase = await createClient()

    // For demo purposes, return mock analytics data
    // In production, you would query your analytics database
    const mockAnalytics = {
      session_id,
      timeframe,
      summary: {
        total_sessions: 45,
        total_events: 1250,
        unique_users: 38,
        avg_session_duration: 245, // seconds
        most_popular_actions: [
          { action: 'chat_message', count: 320 },
          { action: 'camera_capture', count: 180 },
          { action: 'comparison_view', count: 95 },
          { action: 'preferences_update', count: 67 }
        ],
        conversion_funnel: {
          camera_scans: 180,
          phone_recognized: 145,
          chat_started: 120,
          recommendations_viewed: 98,
          preferences_set: 67
        }
      },
      recent_events: [
        {
          event_name: 'session_start',
          timestamp: new Date().toISOString(),
          properties: { referrer: 'direct', screen_resolution: '1920x1080' }
        },
        {
          event_name: 'camera_capture',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          properties: { success: true, processing_time: 2.3 }
        },
        {
          event_name: 'chat_message',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          properties: { message_length: 45, ai_response_time: 1.2 }
        }
      ]
    }

    return NextResponse.json({
      success: true,
      analytics: mockAnalytics
    })

  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    )
  }
}