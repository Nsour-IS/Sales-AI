'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'
import ChatInterface from '@/components/ChatInterface'
import ProductComparison from '@/components/ProductComparison'
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
    brands: { name: string; logo_url?: string } | null
  }
  total_phones_in_db: number
}

export default function Home() {
  const [showCamera, setShowCamera] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPhones, setComparisonPhones] = useState<(MobilePhone & { brands: { name: string; logo_url?: string } | null })[]>([])
  const [isLoadingComparison, setIsLoadingComparison] = useState(false)

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

  const handleSelectPhoneFromComparison = (phone: MobilePhone & { brands: { name: string; logo_url?: string } | null }) => {
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
      <div className="container mx-auto p-4 h-screen flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel - Camera & Analysis */}
        <div className="flex-1 max-w-md mx-auto lg:mx-0">
          {/* Header */}
          <div className="text-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sales AI
            </h1>
            <p className="text-gray-600 text-sm">
              Scan any mobile phone and chat with our AI sales assistant
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
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
              >
                📱 Scan Mobile Phone
              </button>
              
              {!analysisResult && !showChat && (
                <div className="mt-4 text-center space-y-3">
                  <p className="text-gray-500 text-sm mb-3">Or explore phones directly</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowChat(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      💬 Start Chat
                    </button>
                    <div className="text-xs text-gray-400 mb-2">Quick Compare</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleComparePhones('gamers', undefined)}
                        disabled={isLoadingComparison}
                        className="text-sm py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        🎮 Gaming Phones
                      </button>
                      <button
                        onClick={() => handleComparePhones('photographers', undefined)}
                        disabled={isLoadingComparison}
                        className="text-sm py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        📸 Camera Phones
                      </button>
                      <button
                        onClick={() => handleComparePhones(undefined, 'low')}
                        disabled={isLoadingComparison}
                        className="text-sm py-2 px-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                      >
                        💰 Budget Phones
                      </button>
                      <button
                        onClick={() => handleComparePhones(undefined, 'high')}
                        disabled={isLoadingComparison}
                        className="text-sm py-2 px-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
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
          <div className="flex-1 max-w-lg mx-auto lg:mx-0">
            <div className="h-full flex flex-col" style={{ maxHeight: '600px' }}>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">AI Sales Assistant</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <ChatInterface 
                  recognizedPhone={analysisResult?.matched_phone}
                  onStartChat={() => setShowChat(true)}
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
    </div>
  )
}