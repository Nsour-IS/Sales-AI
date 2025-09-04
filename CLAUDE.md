# CLAUDE.md - Sales AI Project

This file provides guidance to Claude Code (claude.ai/code) when working with the Sales AI project.

## Project Vision

**Revolutionary AI-Powered Visual Sales Assistant**
- Replace traditional salesmen in electronics showrooms
- Use computer vision to identify products instantly
- Provide conversational AI with deep product knowledge
- Focus on mobile phones sector for MVP
- Mobile-first responsive design for tablets in showrooms

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

### Database Setup
- `database-schema.sql` - Complete database schema for mobile phones, stores, users
- Run this SQL in your Supabase project to set up all tables

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL) with RLS
- **Authentication**: Supabase Auth with SSR
- **AI Integration**: Anthropic Claude + OpenAI GPT (for vision)
- **Computer Vision**: Google Vision API (planned)
- **Camera**: Native browser MediaDevices API

### Core Application Structure

#### Authentication & Database
- `lib/supabaseClient.ts` - Browser client for Supabase
- `lib/supabaseServer.ts` - Server-side client with cookie handling
- `lib/types.ts` - Complete TypeScript definitions for all entities

#### Database Schema (Comprehensive)
- **brands** - Mobile phone manufacturers (Apple, Samsung, etc.)
- **mobile_phones** - Complete phone specs, features, pricing
- **stores** - Partner retail locations
- **store_inventory** - Stock management with variants
- **user_profiles** - Customer and store owner profiles
- **chat_sessions** - AI conversation sessions
- **chat_messages** - Individual AI chat messages
- **recognition_history** - Camera-based product identification

#### Camera Integration
- `components/CameraCapture.tsx` - Professional camera interface
  - Real-time video capture
  - Photo capture with quality optimization
  - Camera switching (front/back)
  - Scanning guides and overlays
  - Mobile-optimized controls

### Key Features Implemented

#### 1. Product Recognition System
- Camera integration with professional UI
- Image capture optimized for product identification
- Scanning guides for consistent product positioning
- Support for both front and back cameras

#### 2. Database-First Architecture
- Comprehensive mobile phone database schema
- Multi-variant support (RAM, storage, color)
- Store inventory management
- Customer requirement tracking

#### 3. AI Conversation System
- Session-based chat management
- Customer requirement analysis
- Product recommendation engine
- Comparison matrix generation

### Current Implementation Status

#### ✅ Completed
1. **Project Setup**
   - Next.js 15 with TypeScript and Tailwind CSS
   - Supabase configuration (client + server)
   - Git repository with clean initial commit

2. **Database Design**
   - Complete schema for mobile phone e-commerce
   - RLS policies for security
   - Sample data structure for iPhone 15 Pro Max

3. **Camera Integration**
   - Professional camera capture interface
   - Mobile-optimized controls
   - Image quality optimization
   - Real-time preview with scanning guides

4. **Type System**
   - Complete TypeScript definitions
   - Customer requirements interface
   - Product comparison types
   - Chat message structures

#### 🚧 Next Development Phases

##### Phase 1: AI Product Identification
- Implement vision AI integration
- Train model on mobile phone images
- Build confidence scoring system
- Create product matching algorithm

##### Phase 2: Conversational Sales AI
- Build chat interface with mobile-first design
- Implement customer requirement analysis
- Create product recommendation engine
- Add comparison matrix generation

##### Phase 3: Mobile UI/UX
- Design showroom tablet interface
- Customer-facing mobile companion
- Store partner dashboard
- Real-time inventory sync

##### Phase 4: Store Partner System
- Store onboarding flow
- Inventory management dashboard
- Sales analytics and reporting
- Multi-location support

##### Phase 5: Advanced Features
- Voice interaction capabilities
- Augmented reality product overlay
- Integration with POS systems
- Customer behavior analytics

## Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# AI Provider Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# Computer Vision APIs
GOOGLE_VISION_API_KEY=your_google_vision_key
```

## Setup Instructions

### 1. Supabase Setup
```sql
-- Run the complete database-schema.sql in your Supabase project
-- This creates all tables, RLS policies, and sample data
```

### 2. Environment Configuration
```bash
# Copy and fill environment variables
cp .env.local.example .env.local
# Add your actual API keys
```

### 3. Development Start
```bash
npm run dev
# Project will be available at http://localhost:3000
```

## Development Principles

### Code Conventions
- TypeScript strict mode enabled
- Tailwind for all styling (mobile-first approach)
- Component-based architecture with reusable UI elements
- Server-side rendering with Supabase SSR
- Error handling with graceful fallbacks

### Mobile-First Design
- Optimized for tablet displays in showrooms
- Touch-friendly interfaces
- Responsive camera controls
- Fast loading and smooth animations

### AI Integration Strategy
- Database-first approach for product information
- AI enhances rather than replaces structured data
- Confidence scoring for all AI predictions
- Fallback systems for AI failures

### Security & Performance
- Row Level Security (RLS) for all database operations
- Image processing optimization
- Efficient API rate limiting
- User session management

## File Structure Overview

```
sales-ai/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   │   └── CameraCapture.tsx    # Professional camera interface
│   └── lib/
│       ├── supabaseClient.ts    # Browser Supabase client
│       ├── supabaseServer.ts    # Server Supabase client
│       └── types.ts             # TypeScript definitions
├── database-schema.sql      # Complete database setup
├── .env.local              # Environment variables (fill with your keys)
└── CLAUDE.md               # This documentation file
```

## Current Todo List

When you continue development, focus on these priorities:

1. **Set up Supabase Project**
   - Create new Supabase project for Sales AI
   - Run database-schema.sql to create all tables
   - Configure authentication settings

2. **Implement AI Vision System**
   - Build API route for image analysis
   - Integrate OpenAI Vision or Google Vision API
   - Create product matching algorithm

3. **Build Chat Interface**
   - Create conversational AI component
   - Implement customer requirement capture
   - Build product recommendation system

4. **Design Mobile UI**
   - Create tablet-optimized showroom interface
   - Build customer mobile companion app
   - Implement responsive design system

5. **Deploy MVP**
   - Set up Vercel deployment
   - Configure production environment
   - Test on actual mobile devices

## Vision: The Future of Retail

This project aims to revolutionize how customers interact with products in electronics showrooms. By combining computer vision, conversational AI, and comprehensive product databases, we're creating an experience that's more knowledgeable, available, and consistent than traditional sales staff.

**Target User Experience:**
1. Customer enters showroom
2. Uses tablet to scan any mobile phone
3. AI instantly identifies product and specs
4. Conversational interface helps find perfect match
5. Seamless purchase recommendation with inventory check

**Business Impact:**
- Reduced staffing costs for retailers
- Consistent, high-quality customer service
- Data-driven insights into customer preferences  
- 24/7 availability for customer inquiries
- Scalable across multiple store locations

---

*This project represents the next evolution in retail technology - making expert product knowledge accessible to every customer, every time.*