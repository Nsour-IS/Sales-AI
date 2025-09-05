'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'
import ChatInterface from '@/components/ChatInterface'
import ProductComparison from '@/components/ProductComparison'
import PreferencesTracker from '@/components/PreferencesTracker'
import { MobilePhone } from '@/lib/types'

interface AnalysisResult {
  success: boolean
  analysis: {
    recognized_phone_id: string | null
    confidence_score: number
    ai_analysis: {
      detected_features: string[]
      estimated_brand: string
      estimated_model: string
      color: string
      condition: string
    }
  }
  matched_phone?: MobilePhone & {
    brands: { name?: string; logo_url?: string } | null
  }
  total_phones_in_db: number
}

export default function Home() {
  const [showCamera, setShowCamera] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPhones, setComparisonPhones] = useState<(MobilePhone & { brands: { name?: string; logo_url?: string } | null })[]>([])
  const [isLoadingComparison, setIsLoadingComparison] = useState(false)
  const [customerPreferences, setCustomerPreferences] = useState<any>(null)

  const handleImageCapture = async (imageData: string) => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      const result = await response.json()
      setAnalysisResult(result)
      setShowCamera(false)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleComparePhones = async (category?: string, priceRange?: string) => {
    setIsLoadingComparison(true)
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          priceRange,
          features: []
        }),
      })

      const result = await response.json()
      if (result.success) {
        setComparisonPhones(result.phones)
        setShowComparison(true)
      }
    } catch (error) {
      console.error('Comparison failed:', error)
    } finally {
      setIsLoadingComparison(false)
    }
  }

  const handleSelectPhoneFromComparison = (phone: MobilePhone & { brands: { name?: string; logo_url?: string } | null }) => {
    setAnalysisResult({
      success: true,
      analysis: {
        recognized_phone_id: phone.id,
        confidence_score: 0.95,
        ai_analysis: {
          detected_features: phone.key_features || [],
          estimated_brand: phone.brands?.name || 'Unknown',
          estimated_model: phone.display_name || 'Unknown',
          color: 'Unknown',
          condition: 'new'
        }
      },
      matched_phone: phone,
      total_phones_in_db: 25
    })
    setShowComparison(false)
    setShowChat(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-3 md:p-6 h-screen flex flex-col xl:flex-row gap-4 md:gap-6">
        
        {/* Left Panel - Camera & Analysis */}
        <div className="flex-1 max-w-lg mx-auto xl:mx-0 xl:max-w-md">
          {/* Header */}
          <div className="text-center py-4 md:py-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              📱 Sales AI
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              Scan any mobile phone and chat with our AI sales assistant for personalized recommendations
            </p>
          </div>

          {/* Camera Section */}
          {showCamera ? (
            <CameraCapture
              onCapture={handleImageCapture}
              onClose={() => setShowCamera(false)}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-5 md:py-6 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 text-lg md:text-xl touch-manipulation"
              >
                📱 Scan Mobile Phone
              </button>
              
              {!analysisResult && !showChat && (
                <div className="mt-6 text-center space-y-4">
                  <p className="text-gray-500 text-sm md:text-base mb-4">Or explore phones directly</p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowChat(true)}
                      className="text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium py-3 md:py-4 px-6 rounded-xl border border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-colors text-base md:text-lg touch-manipulation"
                    >
                      💬 Start Chat
                    </button>
                    <div className="text-xs md:text-sm text-gray-400 mb-2 mt-2">Quick Compare</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleComparePhones('gamers', undefined)}
                        disabled={isLoadingComparison}
                        className="text-sm md:text-base py-3 md:py-4 px-3 md:px-4 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 active:bg-purple-300 transition-colors disabled:opacity-50 font-medium touch-manipulation"
                      >
                        🎮 Gaming Phones
                      </button>
                      <button
                        onClick={() => handleComparePhones('photographers', undefined)}
                        disabled={isLoadingComparison}
                        className="text-sm md:text-base py-3 md:py-4 px-3 md:px-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 active:bg-green-300 transition-colors disabled:opacity-50 font-medium touch-manipulation"
                      >
                        📸 Camera Phones
                      </button>
                      <button
                        onClick={() => handleComparePhones(undefined, 'low')}
                        disabled={isLoadingComparison}
                        className="text-sm md:text-base py-3 md:py-4 px-3 md:px-4 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 active:bg-yellow-300 transition-colors disabled:opacity-50 font-medium touch-manipulation"
                      >
                        💰 Budget Phones
                      </button>
                      <button
                        onClick={() => handleComparePhones(undefined, 'high')}
                        disabled={isLoadingComparison}
                        className="text-sm md:text-base py-3 md:py-4 px-3 md:px-4 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 active:bg-red-300 transition-colors disabled:opacity-50 font-medium touch-manipulation"
                      >
                        ⭐ Premium Phones
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                {!showChat && (
                  <button
                    onClick={() => setShowChat(true)}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    💬 Ask AI About This Phone
                  </button>
                )}
              </div>
              
              {analysisResult.matched_phone ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg">
                      {analysisResult.matched_phone.brands?.name} {analysisResult.matched_phone.display_name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Screen: {analysisResult.matched_phone.screen_size}&quot; {analysisResult.matched_phone.screen_technology}
                    </p>
                    <p className="text-gray-600">
                      Processor: {analysisResult.matched_phone.processor}
                    </p>
                    <p className="text-green-600 font-medium mt-2">
                      Confidence: {Math.round(analysisResult.analysis.confidence_score * 100)}%
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Database contains {analysisResult.total_phones_in_db} mobile phones
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">No matching phone found in database</p>
                  <p className="text-sm text-gray-500">
                    AI detected: {JSON.stringify(analysisResult.analysis.ai_analysis, null, 2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          {isAnalyzing && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing image...</p>
            </div>
          )}
        </div>

        {/* Right Panel - Chat Interface */}
        {showChat && (
          <div className="flex-1 max-w-2xl mx-auto xl:mx-0">
            <div className="h-full flex flex-col" style={{ maxHeight: '700px' }}>
              <div className="mb-4 flex justify-between items-center bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">🤖 AI Sales Assistant</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700 active:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <div className="flex-1">
                <ChatInterface 
                  recognizedPhone={analysisResult?.matched_phone}
                  onStartChat={() => setShowChat(true)}
                  customerPreferences={customerPreferences}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Comparison Modal */}
      {showComparison && comparisonPhones.length > 0 && (
        <ProductComparison
          phones={comparisonPhones}
          onClose={() => setShowComparison(false)}
          onSelectPhone={handleSelectPhoneFromComparison}
        />
      )}

      {/* Loading Comparison Overlay */}
      {isLoadingComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Loading phone comparison...</p>
          </div>
        </div>
      )}

      {/* Customer Preferences Tracker */}
      <PreferencesTracker
        onPreferencesChange={setCustomerPreferences}
        initialPreferences={customerPreferences}
      />
    </div>
  )
}