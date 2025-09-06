'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Activity, Clock, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { getAnalytics } from '@/lib/analytics'

interface AnalyticsData {
  session: {
    session_id: string;
    start_time: string;
    events_count: number;
    duration_seconds: number;
  };
  events: Array<{
    event_name: string;
    timestamp: string;
    properties: Record<string, string | number | boolean | undefined>;
  }>;
  summary: {
    total_events: number;
    total_interactions: number;
    event_counts: Record<string, number>;
    session_duration: number;
  };
}

interface AnalyticsDashboardProps {
  show?: boolean;
  onClose?: () => void;
}

export default function AnalyticsDashboard({ show = false, onClose }: AnalyticsDashboardProps) {
  const [isOpen, setIsOpen] = useState(show);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsOpen(show);
  }, [show]);

  useEffect(() => {
    if (isOpen && !analyticsData) {
      loadAnalyticsData();
    }
  }, [isOpen, analyticsData]);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    try {
      const data = getAnalytics().getLocalAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatEventName = (eventName: string) => {
    return eventName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white p-3 md:p-4 rounded-full shadow-lg transition-colors z-20 touch-manipulation"
        title="Analytics Dashboard"
      >
        <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">📊 Analytics Dashboard</h2>
              <p className="text-gray-100 text-sm">Real-time usage insights and metrics</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-500 rounded-lg transition-colors touch-manipulation"
            >
              <EyeOff className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          ) : analyticsData ? (
            <div className="space-y-6">
              
              {/* Session Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatDuration(analyticsData.summary.session_duration)}
                      </div>
                      <div className="text-xs text-blue-600">Session Duration</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-green-900">
                        {analyticsData.summary.total_interactions}
                      </div>
                      <div className="text-xs text-green-600">Interactions</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-purple-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-purple-900">
                        {analyticsData.summary.total_events}
                      </div>
                      <div className="text-xs text-purple-600">Total Events</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-orange-900">1</div>
                      <div className="text-xs text-orange-600">Active Session</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                  Event Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.summary.event_counts)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([eventName, count]) => (
                    <div key={eventName} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {formatEventName(eventName)}
                      </span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((count as number) / Math.max(...Object.values(analyticsData.summary.event_counts)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8 text-right">
                          {count as number}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {analyticsData.events.slice(-10).reverse().map((event, index) => (
                    <div key={index} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">
                            {formatEventName(event.event_name)}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {Object.keys(event.properties).length > 0 && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {Object.keys(event.properties).length} properties
                          </div>
                        )}
                      </div>
                      {event.properties.success !== undefined && (
                        <div className={`text-xs mt-2 ${event.properties.success ? 'text-green-600' : 'text-red-600'}`}>
                          {event.properties.success ? '✓ Success' : '✗ Failed'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Session Information</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>Session ID:</strong> {analyticsData.session.session_id}</div>
                  <div><strong>Started:</strong> {new Date(analyticsData.session.start_time).toLocaleString()}</div>
                  <div><strong>Total Events:</strong> {analyticsData.session.events_count}</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analytics data available</p>
              <button
                onClick={loadAnalyticsData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Analytics data is stored locally for privacy
          </div>
          <button
            onClick={loadAnalyticsData}
            className="text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors touch-manipulation"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}