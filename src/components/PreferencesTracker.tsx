'use client'

import React, { useState, useEffect } from 'react'
import { Settings, X, Save, RotateCcw } from 'lucide-react'

interface CustomerPreferences {
  budget_range: 'low' | 'mid' | 'high' | ''
  primary_use: 'photography' | 'gaming' | 'business' | 'daily_use' | ''
  screen_size: 'compact' | 'standard' | 'large' | ''
  brand_preference: string
  battery_importance: 'low' | 'medium' | 'high' | ''
  camera_importance: 'low' | 'medium' | 'high' | ''
  storage_needs: 'basic' | 'moderate' | 'high' | ''
  color_preference: string
}

interface PreferencesTrackerProps {
  onPreferencesChange: (preferences: CustomerPreferences) => void
  initialPreferences?: Partial<CustomerPreferences>
  show?: boolean
  onClose?: () => void
}

const defaultPreferences: CustomerPreferences = {
  budget_range: '',
  primary_use: '',
  screen_size: '',
  brand_preference: '',
  battery_importance: '',
  camera_importance: '',
  storage_needs: '',
  color_preference: ''
}

export default function PreferencesTracker({ 
  onPreferencesChange, 
  initialPreferences = {},
  show = false,
  onClose 
}: PreferencesTrackerProps) {
  const [preferences, setPreferences] = useState<CustomerPreferences>({
    ...defaultPreferences,
    ...initialPreferences
  })
  const [isOpen, setIsOpen] = useState(show)

  useEffect(() => {
    setIsOpen(show)
  }, [show])

  const handlePreferenceChange = (key: keyof CustomerPreferences, value: string) => {
    const updatedPreferences = { ...preferences, [key]: value }
    setPreferences(updatedPreferences)
    onPreferencesChange(updatedPreferences)
  }

  const handleSave = () => {
    // Save to localStorage for session persistence
    localStorage.setItem('customerPreferences', JSON.stringify(preferences))
    setIsOpen(false)
    onClose?.()
  }

  const handleReset = () => {
    setPreferences(defaultPreferences)
    onPreferencesChange(defaultPreferences)
    localStorage.removeItem('customerPreferences')
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customerPreferences')
    if (saved) {
      try {
        const parsedPreferences = JSON.parse(saved)
        setPreferences({ ...defaultPreferences, ...parsedPreferences })
        onPreferencesChange({ ...defaultPreferences, ...parsedPreferences })
      } catch (error) {
        console.error('Failed to parse saved preferences:', error)
      }
    }
  }, [onPreferencesChange])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-20"
        title="Customer Preferences"
      >
        <Settings className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-1">Customer Preferences</h2>
              <p className="text-blue-100 text-sm">Help us personalize your recommendations</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          
          {/* Budget Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Budget Range</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: '$200-400', color: 'green' },
                { value: 'mid', label: '$400-800', color: 'blue' },
                { value: 'high', label: '$800+', color: 'purple' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('budget_range', option.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    preferences.budget_range === option.value
                      ? `bg-${option.color}-600 text-white`
                      : `bg-${option.color}-100 text-${option.color}-700 hover:bg-${option.color}-200`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Use */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Use</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'photography', label: '📸 Photography', desc: 'Camera quality matters' },
                { value: 'gaming', label: '🎮 Gaming', desc: 'Performance & display' },
                { value: 'business', label: '💼 Business', desc: 'Productivity & battery' },
                { value: 'daily_use', label: '📱 Daily Use', desc: 'General purpose' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('primary_use', option.value)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    preferences.primary_use === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Screen Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Screen Size Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'compact', label: 'Compact', desc: 'Under 6"' },
                { value: 'standard', label: 'Standard', desc: '6" - 6.5"' },
                { value: 'large', label: 'Large', desc: '6.5"+ ' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('screen_size', option.value)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    preferences.screen_size === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Importance Ratings */}
          <div className="grid grid-cols-2 gap-6">
            {/* Camera Importance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Camera Importance</label>
              <div className="space-y-2">
                {[
                  { value: 'high', label: 'Very Important' },
                  { value: 'medium', label: 'Somewhat Important' },
                  { value: 'low', label: 'Not Important' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handlePreferenceChange('camera_importance', option.value)}
                    className={`w-full p-2 rounded-lg text-sm transition-colors ${
                      preferences.camera_importance === option.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery Importance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Battery Life Importance</label>
              <div className="space-y-2">
                {[
                  { value: 'high', label: 'Very Important' },
                  { value: 'medium', label: 'Somewhat Important' },
                  { value: 'low', label: 'Not Important' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handlePreferenceChange('battery_importance', option.value)}
                    className={`w-full p-2 rounded-lg text-sm transition-colors ${
                      preferences.battery_importance === option.value
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Brand Preference (Optional)</label>
            <input
              type="text"
              value={preferences.brand_preference}
              onChange={(e) => handlePreferenceChange('brand_preference', e.target.value)}
              placeholder="e.g., Apple, Samsung, Google..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}