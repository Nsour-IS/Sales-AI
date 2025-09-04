'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'
import ChatInterface from '@/components/ChatInterface'
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
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm mb-3">Or start chatting directly</p>
                  <button
                    onClick={() => setShowChat(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    💬 Start Chat
                  </button>
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
    </div>
  )
}