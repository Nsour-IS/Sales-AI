// Sales AI TypeScript Types

export interface Brand {
  id: string
  name: string
  logo_url?: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface MobilePhone {
  id: string
  brand_id: string
  brand?: Brand
  model_name: string
  display_name: string
  price_range: 'high' | 'mid' | 'low'
  
  // Technical specifications
  screen_size?: number
  screen_resolution?: string
  screen_technology?: string
  
  processor?: string
  ram_gb?: number[]
  storage_gb?: number[]
  
  // Camera specs
  main_camera_mp?: number
  front_camera_mp?: number
  camera_features?: string[]
  
  // Battery and connectivity
  battery_mah?: number
  fast_charging?: boolean
  wireless_charging?: boolean
  five_g?: boolean
  
  // Physical attributes
  colors?: string[]
  weight_grams?: number
  dimensions?: string
  water_resistance?: string
  
  // Operating system
  os?: string
  
  // Availability
  release_date?: string
  is_available: boolean
  
  // AI training data
  key_features?: string[]
  target_audience?: string[]
  comparison_points?: Record<string, string | number | boolean>
  
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  owner_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StoreInventory {
  id: string
  store_id: string
  phone_id: string
  phone?: MobilePhone
  variant_ram: number
  variant_storage: number
  variant_color: string
  price: number
  stock_quantity: number
  is_display_model: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  full_name?: string
  email?: string
  role: 'customer' | 'store_owner' | 'admin'
  store_id?: string
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id?: string
  store_id?: string
  session_token?: string
  status: 'active' | 'completed' | 'abandoned'
  customer_requirements?: CustomerRequirements
  recommended_phones?: string[]
  created_at: string
  updated_at: string
}

export interface CustomerRequirements {
  budget_min?: number
  budget_max?: number
  preferred_brands?: string[]
  primary_use_cases?: string[] // ['photography', 'gaming', 'business', 'daily_use']
  screen_size_preference?: 'compact' | 'standard' | 'large'
  storage_needs?: 'basic' | 'moderate' | 'high'
  camera_importance?: 'low' | 'medium' | 'high'
  battery_importance?: 'low' | 'medium' | 'high'
  gaming_performance?: boolean
  brand_loyalty?: string
}

export interface ChatMessage {
  id: string
  session_id: string
  sender_type: 'user' | 'ai' | 'system'
  message_text: string
  message_data?: Record<string, unknown>
  created_at: string
}

export interface RecognitionResult {
  id: string
  session_id?: string
  image_url?: string
  recognized_phone_id?: string
  confidence_score?: number
  ai_analysis?: Record<string, unknown>
  created_at: string
}

// AI Analysis Types
export interface PhoneComparison {
  phones: MobilePhone[]
  comparison_matrix: ComparisonPoint[]
  recommendation: {
    winner_id: string
    reasoning: string
    score: number
  }
}

export interface ComparisonPoint {
  category: string
  phones: {
    phone_id: string
    value: string | number
    rating: number // 1-5
  }[]
}

// Camera Integration Types
export interface CameraCapture {
  image_data: string // base64
  timestamp: number
  analysis_requested: boolean
}