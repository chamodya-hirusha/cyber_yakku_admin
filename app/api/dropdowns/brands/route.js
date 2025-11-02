import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    
    const connection = await pool.getConnection()
    
    let query = `
      SELECT DISTINCT b.id, b.name
      FROM brand b
    `
    const params = []
    
    if (categoryId) {
      // Get brands that are used in vehicle, weapon, or skin tables for this category
      query += `
        WHERE b.id IN (
          SELECT DISTINCT brand_id FROM vehicle WHERE category_id = ? AND brand_id IS NOT NULL
          UNION
          SELECT DISTINCT brand_id FROM weapon WHERE category_id = ? AND brand_id IS NOT NULL
          UNION
          SELECT DISTINCT brand_id FROM skin WHERE category_id = ? AND brand_id IS NOT NULL
        )
      `
      params.push(categoryId, categoryId, categoryId)
    }
    
    query += ` ORDER BY b.name ASC`
    
    const [brands] = await connection.execute(query, params)
    connection.release()

    return NextResponse.json({
      success: true,
      data: brands || []
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch brands: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, category_id } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      )
    }

    if (!category_id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    // Check if brand with same name already exists
    const [existing] = await connection.execute(
      'SELECT id FROM brand WHERE name = ?',
      [name.trim()]
    )

    if (existing.length > 0) {
      connection.release()
      return NextResponse.json(
        { success: false, error: 'Brand with this name already exists' },
        { status: 409 }
      )
    }

    // Insert new brand
    const [result] = await connection.execute(
      'INSERT INTO brand (name, category_id) VALUES (?, ?)',
      [name.trim(), category_id]
    )

    // Fetch the created brand
    const [rows] = await connection.execute(
      'SELECT id, name FROM brand WHERE id = ?',
      [result.insertId]
    )

    connection.release()

    return NextResponse.json({
      success: true,
      message: 'Brand created successfully',
      data: rows[0]
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { success: false, error: `Failed to create brand: ${error.message}` },
      { status: 500 }
    )
  }
}

