import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { phoneIds, category, priceRange, features } = await request.json()
    
    const supabase = await createClient()

    let query = supabase
      .from('mobile_phones')
      .select(`
        *,
        brands (
          name,
          logo_url
        )
      `)
      .eq('is_available', true)

    // If specific phone IDs are provided
    if (phoneIds && phoneIds.length > 0) {
      query = query.in('id', phoneIds)
    } else {
      // Smart comparison logic based on criteria
      if (category) {
        query = query.contains('target_audience', [category])
      }
      
      if (priceRange) {
        query = query.eq('price_range', priceRange)
      }
      
      if (features && features.length > 0) {
        // Find phones that have any of the requested features
        query = query.or(
          features.map((feature: string) => 
            `key_features.cs.{"${feature}"}`
          ).join(',')
        )
      }
      
      // Limit to 4 phones max for comparison
      query = query.limit(4)
    }

    const { data: phones, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch phones for comparison' }, { status: 500 })
    }

    // If we got less than 2 phones, get some popular alternatives
    if (!phoneIds && phones && phones.length < 2) {
      const { data: fallbackPhones } = await supabase
        .from('mobile_phones')
        .select(`
          *,
          brands (
            name,
            logo_url
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(3)

      return NextResponse.json({
        success: true,
        phones: fallbackPhones || [],
        message: 'Showing popular alternatives for comparison'
      })
    }

    return NextResponse.json({
      success: true,
      phones: phones || [],
      count: phones?.length || 0
    })

  } catch (error) {
    console.error('Comparison error:', error)
    return NextResponse.json(
      { error: 'Failed to process comparison request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const priceRange = searchParams.get('priceRange')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('mobile_phones')
      .select(`
        *,
        brands (
          name,
          logo_url
        )
      `)
      .eq('is_available', true)

    if (category) {
      query = query.contains('target_audience', [category])
    }
    
    if (priceRange) {
      query = query.eq('price_range', priceRange)
    }

    // Get top 3 phones for quick comparison
    query = query.limit(3)

    const { data: phones, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch phones' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      phones: phones || [],
      count: phones?.length || 0
    })

  } catch (error) {
    console.error('Comparison GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comparison data' },
      { status: 500 }
    )
  }
}