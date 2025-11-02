import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    
    const connection = await pool.getConnection()
    
    let query = `
      SELECT DISTINCT m.id, m.name
      FROM model m
    `
    const params = []
    
    if (categoryId) {
      // Get models that are used in vehicle, weapon, or skin tables for this category
      query += `
        WHERE m.id IN (
          SELECT DISTINCT model_id FROM vehicle WHERE category_id = ? AND model_id IS NOT NULL
          UNION
          SELECT DISTINCT model_id FROM weapon WHERE category_id = ? AND model_id IS NOT NULL
          UNION
          SELECT DISTINCT model_id FROM skin WHERE category_id = ? AND model_id IS NOT NULL
        )
      `
      params.push(categoryId, categoryId, categoryId)
    }
    
    query += ` ORDER BY m.name ASC`
    
    const [models] = await connection.execute(query, params)
    connection.release()

    return NextResponse.json({
      success: true,
      data: models || []
    })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch models: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, brand_id } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Model name is required' },
        { status: 400 }
      )
    }

    if (!brand_id) {
      return NextResponse.json(
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    // Check if model with same name already exists
    const [existing] = await connection.execute(
      'SELECT id FROM model WHERE name = ?',
      [name.trim()]
    )

    if (existing.length > 0) {
      connection.release()
      return NextResponse.json(
        { success: false, error: 'Model with this name already exists' },
        { status: 409 }
      )
    }

    // Insert new model
    const [result] = await connection.execute(
      'INSERT INTO model (name, brand_id) VALUES (?, ?)',
      [name.trim(), brand_id]
    )

    // Fetch the created model
    const [rows] = await connection.execute(
      'SELECT id, name FROM model WHERE id = ?',
      [result.insertId]
    )

    connection.release()

    return NextResponse.json({
      success: true,
      message: 'Model created successfully',
      data: rows[0]
    })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { success: false, error: `Failed to create model: ${error.message}` },
      { status: 500 }
    )
  }
}

