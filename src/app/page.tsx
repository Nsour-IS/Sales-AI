'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sales AI
          </h1>
          <p className="text-gray-600">
            Point your camera at any mobile phone to get instant product information
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
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
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
    </div>
  )
}