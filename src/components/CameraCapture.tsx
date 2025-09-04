'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Square, RotateCcw, X } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose?: () => void
  isAnalyzing?: boolean
}

export default function CameraCapture({ onCapture, onClose, isAnalyzing = false }: CameraCaptureProps) {
  const [isActive, setIsActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      
      setIsActive(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please ensure you have granted camera permissions.')
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsActive(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    
    onCapture(imageData)
    stopCamera()
  }, [onCapture, stopCamera])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    stopCamera()
  }, [stopCamera])

  // Restart camera when facing mode changes
  React.useEffect(() => {
    if (isActive) {
      startCamera()
    }
  }, [facingMode, startCamera, isActive])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          disabled={isAnalyzing}
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <h2 className="text-white font-semibold text-lg">
          {isAnalyzing ? 'Analyzing...' : 'Scan Product'}
        </h2>
        
        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          disabled={!isActive || isAnalyzing}
        >
          <RotateCcw className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {!isActive ? (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <button
              onClick={startCamera}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors"
              disabled={isAnalyzing}
            >
              <Camera className="w-6 h-6" />
              Start Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Overlay guides */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning frame */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-white/50 rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
              </div>
              
              {/* Instructions */}
              <div className="absolute top-8 left-4 right-4 text-center">
                <p className="text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Position the phone within the frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {isActive && (
        <div className="flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Square className="w-8 h-8 text-white fill-white" />
            )}
          </button>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}