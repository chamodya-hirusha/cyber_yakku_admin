import { NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET /api/home/content-cards - Fetch all content cards
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    let query = `
      SELECT 
        id,
        title,
        description,
        image_url,
        link,
        link_target,
        card_style,
        icon,
        badge_text,
        badge_color,
        order_index,
        active,
        created_at,
        updated_at
      FROM content_cards
      WHERE 1=1
    `
    const params = []

    if (active !== null) {
      query += ' AND active = ?'
      params.push(active === 'true')
    }

    query += ' ORDER BY order_index ASC, created_at ASC'

    const [rows] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Error fetching content cards:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content cards' },
      { status: 500 }
    )
  }
}

// POST /api/home/content-cards - Create a new content card
export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      image_url,
      link,
      link_target = '_self',
      card_style,
      icon,
      badge_text,
      badge_color = '#FF0000',
      active = true,
      order_index = 0
    } = body

    const query = `
      INSERT INTO content_cards (
        title, description, image_url, link, link_target,
        card_style, icon, badge_text, badge_color, active, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      title, description, image_url, link, link_target,
      JSON.stringify(card_style), icon, badge_text, badge_color, active, order_index
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
    console.error('Error creating content card:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create content card' },
      { status: 500 }
    )
  }
}

// PUT /api/home/content-cards - Update a content card
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content card ID is required' },
        { status: 400 }
      )
    }

    const fields = []
    const params = []

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'card_style') {
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

    const query = `UPDATE content_cards SET ${fields.join(', ')} WHERE id = ?`
    
    await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      message: 'Content card updated successfully'
    })
  } catch (error) {
    console.error('Error updating content card:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update content card' },
      { status: 500 }
    )
  }
}

// DELETE /api/home/content-cards - Delete a content card
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content card ID is required' },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM content_cards WHERE id = ?'
    await pool.execute(query, [id])

    return NextResponse.json({
      success: true,
      message: 'Content card deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting content card:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete content card' },
      { status: 500 }
    )
  }
}

