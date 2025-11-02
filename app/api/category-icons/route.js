import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        id,
        name as label
      FROM Category
      ORDER BY name ASC
    `)
    
    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const [icons] = await pool.execute(`
      SELECT DISTINCT
        name as label
      FROM Category
      WHERE icon IS NOT NULL
      ORDER BY name ASC
    `)
    
    return NextResponse.json({
      success: true,
      data: icons
    })
  } catch (error) {
    console.error('Error fetching category icons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category icons' },
      { status: 500 }
    )
  }
}