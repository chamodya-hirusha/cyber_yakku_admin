import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    
    const connection = await pool.getConnection()
    
    let query = `
      SELECT DISTINCT t.id, t.type_name as name
      FROM type t
    `
    const params = []
    
    if (categoryId) {
      // Get types that are used in vehicle, weapon, skin, or currency tables for this category
      query += `
        WHERE t.id IN (
          SELECT DISTINCT type_id FROM vehicle WHERE category_id = ? AND type_id IS NOT NULL
          UNION
          SELECT DISTINCT type_id FROM weapon WHERE category_id = ? AND type_id IS NOT NULL
          UNION
          SELECT DISTINCT type_id FROM skin WHERE category_id = ? AND type_id IS NOT NULL
          UNION
          SELECT DISTINCT type_id FROM currency WHERE category_id = ? AND type_id IS NOT NULL
        )
      `
      params.push(categoryId, categoryId, categoryId, categoryId)
    }
    
    query += ` ORDER BY t.type_name ASC`
    
    const [types] = await connection.execute(query, params)
    connection.release()

    return NextResponse.json({
      success: true,
      data: types || []
    })
  } catch (error) {
    console.error('Error fetching types:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch types: ${error.message}` },
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
        { success: false, error: 'Type name is required' },
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

    // Check if type with same name already exists
    const [existing] = await connection.execute(
      'SELECT id FROM type WHERE type_name = ?',
      [name.trim()]
    )

    if (existing.length > 0) {
      connection.release()
      return NextResponse.json(
        { success: false, error: 'Type with this name already exists' },
        { status: 409 }
      )
    }

    // Insert new type
    const [result] = await connection.execute(
      'INSERT INTO type (type_name, category_id) VALUES (?, ?)',
      [name.trim(), category_id]
    )

    // Fetch the created type
    const [rows] = await connection.execute(
      'SELECT id, type_name as name FROM type WHERE id = ?',
      [result.insertId]
    )

    connection.release()

    return NextResponse.json({
      success: true,
      message: 'Type created successfully',
      data: rows[0]
    })
  } catch (error) {
    console.error('Error creating type:', error)
    return NextResponse.json(
      { success: false, error: `Failed to create type: ${error.message}` },
      { status: 500 }
    )
  }
}

