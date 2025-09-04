# Sales AI - Setup Instructions

## Quick Start Guide

### 1. Environment Setup

**Copy and configure environment variables:**
```bash
# The .env.local template is already created
# Fill in your actual API keys:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

ANTHROPIC_API_KEY=your-anthropic-key-here
OPENAI_API_KEY=your-openai-key-here
GOOGLE_VISION_API_KEY=your-google-vision-key-here
```

### 2. Supabase Database Setup

**Create new Supabase project:**
1. Go to https://supabase.com/dashboard
2. Create new project: "Sales AI"
3. Wait for setup to complete
4. Go to SQL Editor
5. Run the complete `database-schema.sql` file

**The schema includes:**
- ✅ All tables (brands, mobile_phones, stores, etc.)
- ✅ Row Level Security policies
- ✅ Sample data (iPhone 15 Pro Max example)
- ✅ Database functions for analytics

### 3. Development Server

```bash
npm run dev
```
**Project will be available at:** http://localhost:3000

---

## What's Already Built

### ✅ Core Infrastructure
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for styling
- **Supabase** client and server configuration
- **Git repository** with clean initial commit

### ✅ Database Design
- **Complete schema** for mobile phone e-commerce
- **Multi-variant support** (RAM, storage, color)
- **Store inventory management**
- **Customer conversation tracking**
- **Product recognition history**

### ✅ Camera Integration
- **Professional camera interface** (`CameraCapture.tsx`)
- **Mobile-optimized controls**
- **Front/back camera switching**
- **Image capture with scanning guides**
- **Quality optimization for AI analysis**

### ✅ Type System
- **Comprehensive TypeScript definitions**
- **Database entity types**
- **API response types**
- **UI component prop types**

---

## Next Development Steps

### Phase 1: AI Vision System (Next Priority)

**1. Create Vision API Route:**
```typescript
// Create: src/app/api/analyze-product/route.ts
// - Accept image from CameraCapture component
// - Use OpenAI Vision API for product identification
// - Match against mobile_phones database
// - Return product details with confidence score
```

**2. Connect Camera to AI:**
```typescript
// Update: src/components/CameraCapture.tsx
// - Add onCapture handler to send image to API
// - Show loading state during analysis
// - Display results or error feedback
```

**3. Test Product Recognition:**
- Take photos of mobile phones
- Verify AI identification accuracy
- Refine matching algorithm

### Phase 2: Conversational AI

**1. Build Chat Interface:**
```typescript
// Create: src/components/ChatInterface.tsx
// - Mobile-optimized conversation UI
// - Message history display
// - Product card integration
```

**2. Create Chat API:**
```typescript
// Create: src/app/api/chat/route.ts
// - Customer requirement analysis
// - Product recommendations
// - Comparison generation
```

### Phase 3: Mobile UI/UX

**1. Main App Layout:**
- Tablet-optimized showroom interface
- Easy camera activation
- Professional product displays

**2. Responsive Design:**
- Customer mobile companion
- Cross-device session sync
- Touch-friendly controls

---

## File Structure Reference

```
sales-ai/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   └── CameraCapture.tsx  # ✅ Professional camera interface
│   └── lib/
│       ├── supabaseClient.ts  # ✅ Browser client
│       ├── supabaseServer.ts  # ✅ Server client with SSR
│       └── types.ts           # ✅ Complete TypeScript types
├── database-schema.sql        # ✅ Complete database setup
├── .env.local                 # ⚠️  Add your API keys here
├── CLAUDE.md                  # ✅ Complete project documentation
├── PROJECT_ROADMAP.md         # ✅ Development phases
└── SETUP_INSTRUCTIONS.md      # ✅ This file
```

---

## Testing Checklist

### ✅ Completed Setup
- [x] Next.js development server starts
- [x] TypeScript compilation works
- [x] Tailwind CSS styles load
- [x] Git repository initialized

### 🔄 Next Tests (After Supabase Setup)
- [ ] Database connection works
- [ ] Camera component loads
- [ ] Image capture functions
- [ ] API routes respond correctly

### 📱 Mobile Testing (Future)
- [ ] Camera works on iOS Safari
- [ ] Camera works on Android Chrome
- [ ] Touch controls are responsive
- [ ] Image quality is sufficient for AI

---

## Development Tools

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features (built-in)
- Tailwind CSS IntelliSense
- Supabase (for database management)
- ES7+ React/Redux/React-Native snippets

### Useful Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality

# Database
# Run database-schema.sql in Supabase SQL Editor

# Git
git add .            # Stage changes
git commit -m "msg"  # Commit changes
git push             # Push to GitHub
```

---

## Troubleshooting

### Common Issues

**1. Environment Variables Not Working**
- Ensure `.env.local` has no quotes around values
- Restart development server after changes
- Check Supabase project URL format

**2. Camera Not Working**
- Ensure HTTPS in production (required for camera)
- Check browser permissions
- Test on actual mobile device

**3. Database Connection Issues**
- Verify Supabase project is active
- Check API keys are correct
- Ensure RLS policies are properly configured

### Getting Help

**Documentation References:**
- `CLAUDE.md` - Complete project documentation
- `PROJECT_ROADMAP.md` - Development phases and timeline
- Database schema comments for table relationships

**External Resources:**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Ready to Build! 🚀

The Sales AI project has a solid foundation and clear path forward. The next step is setting up your Supabase project and implementing the AI vision system to create the first working product recognition demo.

**Happy coding!** The future of retail technology starts here.