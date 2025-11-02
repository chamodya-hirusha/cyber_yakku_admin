import { NextResponse } from 'next/server'

import pool from '@/lib/database'

export async function GET() {
  try {
    const connection = await pool.getConnection()
    
    // Fetch categories from database - Category table with only id and name columns
    const [categories] = await connection.execute(`
      SELECT
        id,
        name
      FROM Category
      ORDER BY id ASC, name ASC
    `)
    
    connection.release()
    
    // Map categories with default values
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      productCount: 0, // Default to 0 since we don't have product count
      children: []
    }))
    
    console.log(`Loaded ${formattedCategories.length} categories`)
    
    return NextResponse.json({
      success: true,
      data: formattedCategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch categories: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    // Check if category with same name already exists
    const [existing] = await connection.execute(
      'SELECT id FROM Category WHERE name = ?',
      [name.trim()]
    )

    if (existing.length > 0) {
      connection.release()
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    // Insert new category - only id and name columns
    const [result] = await connection.execute(`
      INSERT INTO Category (name)
      VALUES (?)
    `, [name.trim()])

    const newCategoryId = result.insertId

    // Fetch the created category
    const [rows] = await connection.execute(`
      SELECT id, name
      FROM Category
      WHERE id = ?
    `, [newCategoryId])

    connection.release()

    const newCategory = {
      id: rows[0].id,
      name: rows[0].name,
      productCount: 0,
      children: []
    }

    return NextResponse.json({
      success: true,
      data: newCategory,
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: `Failed to create category: ${error.message}` },
      { status: 500 }
    )
  }
}
