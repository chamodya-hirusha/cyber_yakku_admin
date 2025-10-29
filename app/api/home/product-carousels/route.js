import { NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET /api/home/product-carousels - Fetch all product carousels
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const carouselType = searchParams.get('type')
    const active = searchParams.get('active')

    let query = `
      SELECT 
        id,
        title,
        description,
        icon,
        carousel_type,
        product_ids,
        display_limit,
        auto_play,
        auto_play_speed,
        show_dots,
        show_arrows,
        card_style,
        order_index,
        active,
        created_at,
        updated_at
      FROM product_carousels
      WHERE 1=1
    `
    const params = []

    if (carouselType) {
      query += ' AND carousel_type = ?'
      params.push(carouselType)
    }

    if (active !== null) {
      query += ' AND active = ?'
      params.push(active === 'true')
    }

    query += ' ORDER BY order_index ASC, created_at ASC'

    const [rows] = await pool.execute(query, params)

    // Parse JSON fields
    const processedRows = rows.map(row => ({
      ...row,
      product_ids: JSON.parse(row.product_ids || '[]'),
      card_style: row.card_style ? JSON.parse(row.card_style) : null
    }))

    return NextResponse.json({
      success: true,
      data: processedRows,
    })
  } catch (error) {
    console.error('Error fetching product carousels:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product carousels' },
      { status: 500 }
    )
  }
}

// POST /api/home/product-carousels - Create a new product carousel
export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      icon,
      carousel_type,
      product_ids = [],
      display_limit = 10,
      auto_play = true,
      auto_play_speed = 3000,
      show_dots = true,
      show_arrows = true,
      card_style,
      active = true,
      order_index = 0
    } = body

    const query = `
      INSERT INTO product_carousels (
        title, description, icon, carousel_type, product_ids,
        display_limit, auto_play, auto_play_speed, show_dots,
        show_arrows, card_style, active, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      title, description, icon, carousel_type, JSON.stringify(product_ids),
      display_limit, auto_play, auto_play_speed, show_dots,
      show_arrows, JSON.stringify(card_style), active, order_index
    ]

    const [result] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating product carousel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product carousel' },
      { status: 500 }
    )
  }
}

// PUT /api/home/product-carousels - Update a product carousel
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product carousel ID is required' },
        { status: 400 }
      )
    }

    const fields = []
    const params = []

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'product_ids' || key === 'card_style') {
        fields.push(`${key} = ?`)
        params.push(JSON.stringify(value))
      } else {
        fields.push(`${key} = ?`)
        params.push(value)
      }
    })

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    const query = `UPDATE product_carousels SET ${fields.join(', ')} WHERE id = ?`
    
    await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      message: 'Product carousel updated successfully'
    })
  } catch (error) {
    console.error('Error updating product carousel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product carousel' },
      { status: 500 }
    )
  }
}

// DELETE /api/home/product-carousels - Delete a product carousel
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product carousel ID is required' },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM product_carousels WHERE id = ?'
    await pool.execute(query, [id])

    return NextResponse.json({
      success: true,
      message: 'Product carousel deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product carousel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product carousel' },
      { status: 500 }
    )
  }
}

