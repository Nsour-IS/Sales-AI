'use client'

import React from 'react'
import { X, ArrowRight } from 'lucide-react'

import { MobilePhone } from '@/lib/types'

interface ProductComparisonProps {
  phones: (MobilePhone & { brands: { name?: string; logo_url?: string } | null })[]
  onClose: () => void
  onSelectPhone?: (phone: MobilePhone & { brands: { name?: string; logo_url?: string } | null }) => void
}

export default function ProductComparison({ phones, onClose, onSelectPhone }: ProductComparisonProps) {
  const getPriceRangeDisplay = (range: string) => {
    switch (range) {
      case 'low': return '$200-400'
      case 'mid': return '$400-800'
      case 'high': return '$800+'
      default: return 'Contact for price'
    }
  }

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'mid': return 'text-blue-600 bg-blue-100'
      case 'high': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderComparisonRow = (label: string, values: (string | number | null | undefined)[], highlight: boolean = false) => (
    <tr className={`border-b ${highlight ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">{label}</td>
      {values.map((value, index) => (
        <td key={index} className="px-4 py-3 text-center">
          {value ? (
            <span className={highlight ? 'font-semibold text-blue-900' : 'text-gray-700'}>
              {value}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
      ))}
    </tr>
  )

  const renderFeatureRow = (label: string, features: (string[] | undefined)[], highlight: boolean = false) => (
    <tr className={`border-b ${highlight ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">{label}</td>
      {features.map((featureArray, index) => (
        <td key={index} className="px-4 py-2">
          <div className="flex flex-wrap gap-1 justify-center">
            {featureArray?.slice(0, 3).map((feature, featureIndex) => (
              <span
                key={featureIndex}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {feature}
              </span>
            ))}
            {featureArray && featureArray.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                +{featureArray.length - 3} more
              </span>
            )}
          </div>
        </td>
      ))}
    </tr>
  )

  if (phones.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Phone Comparison</h2>
              <p className="text-blue-100">Compare {phones.length} phones side by side</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[calc(90vh-200px)]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 sticky top-0 z-20">
                <th className="px-4 py-4 text-left font-semibold sticky left-0 bg-gray-100 z-30 min-w-[150px]">
                  Specification
                </th>
                {phones.map((phone, index) => (
                  <th key={phone.id || index} className="px-4 py-4 text-center min-w-[200px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="font-bold text-gray-900">
                        {phone.brands?.name} {phone.display_name}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriceRangeColor(phone.price_range || '')}`}>
                        {getPriceRangeDisplay(phone.price_range || '')}
                      </div>
                      {onSelectPhone && (
                        <button
                          onClick={() => onSelectPhone(phone)}
                          className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          Select <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderComparisonRow(
                'Screen Size',
                phones.map(p => p.screen_size ? `${p.screen_size}"` : undefined),
                true
              )}
              
              {renderComparisonRow(
                'Screen Technology',
                phones.map(p => p.screen_technology)
              )}
              
              {renderComparisonRow(
                'Processor',
                phones.map(p => p.processor),
                true
              )}
              
              {renderComparisonRow(
                'Storage Options',
                phones.map(p => p.storage_gb ? 
                  p.storage_gb.map((s: number) => `${s}GB`).join(', ') : undefined
                )
              )}
              
              {renderComparisonRow(
                'RAM Options',
                phones.map(p => p.ram_gb ? 
                  p.ram_gb.map((r: number) => `${r}GB`).join(', ') : undefined
                ),
                true
              )}
              
              {renderComparisonRow(
                'Main Camera',
                phones.map(p => p.main_camera_mp ? `${p.main_camera_mp}MP` : undefined)
              )}
              
              {renderComparisonRow(
                'Battery',
                phones.map(p => p.battery_mah ? `${p.battery_mah}mAh` : undefined),
                true
              )}
              
              {renderComparisonRow(
                'OS',
                phones.map(p => p.os)
              )}
              
              {renderFeatureRow(
                'Key Features',
                phones.map(p => p.key_features),
                true
              )}
              
              {renderFeatureRow(
                'Target Audience',
                phones.map(p => p.target_audience)
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Swipe horizontally to see more details
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}