import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { tableName: categoryId } = await params;
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const connection = await pool.getConnection()

    let query = `SELECT id, name, data, status, created_at FROM category_items WHERE category_id = ?`
    let queryParams = [categoryId]

    if (search) {
      query += ` AND name LIKE ?`
      queryParams.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await connection.execute(query, queryParams)
    connection.release()

    // Parse JSON data for each item
    const formattedItems = rows.map(item => ({
      id: item.id,
      name: item.name,
      ...JSON.parse(item.data || '{}'),
      status: item.status,
      created_at: item.created_at
    }))

    return NextResponse.json({
      success: true,
      data: formattedItems,
      columns: ['id', 'name', 'status'] // Default columns, can be extended
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { tableName: categoryId } = await params;
    const body = await request.json()

    const connection = await pool.getConnection()

    // Extract name and status, store rest in data JSON
    const { name, status, ...itemData } = body

    if (!name || name.trim() === '') {
      connection.release()
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const query = `INSERT INTO category_items (category_id, name, data, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`
    const values = [
      categoryId,
      name.trim(),
      JSON.stringify(itemData),
      status || 'Active'
    ]

    const [result] = await connection.execute(query, values)
    const newItemId = result.insertId

    // Fetch the created item
    const [rows] = await connection.execute(
      `SELECT id, name, data, status, created_at FROM category_items WHERE id = ?`,
      [newItemId]
    )

    connection.release()

    const item = rows[0]
    const formattedItem = {
      id: item.id,
      name: item.name,
      ...JSON.parse(item.data || '{}'),
      status: item.status,
      created_at: item.created_at
    }

    return NextResponse.json({
      success: true,
      data: formattedItem
    })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
