import { NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET /api/home/hero-sections - Fetch all hero sections
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionType = searchParams.get('type')
    const active = searchParams.get('active')

    let query = `
      SELECT 
        id,
        section_type,
        title,
        subtitle,
        description,
        bg_image_url,
        cta_text,
        cta_link,
        cta_style,
        overlay_opacity,
        text_color,
        text_alignment,
        active,
        order_index,
        created_at,
        updated_at
      FROM hero_sections
      WHERE 1=1
    `
    const params = []

    if (sectionType) {
      query += ' AND section_type = ?'
      params.push(sectionType)
    }

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
    console.error('Error fetching hero sections:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero sections' },
      { status: 500 }
    )
  }
}

// POST /api/home/hero-sections - Create a new hero section
export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      section_type,
      title,
      subtitle,
      description,
      bg_image_url,
      cta_text,
      cta_link,
      cta_style,
      overlay_opacity,
      text_color,
      text_alignment,
      active = true,
      order_index = 0
    } = body

    const query = `
      INSERT INTO hero_sections (
        section_type, title, subtitle, description, bg_image_url,
        cta_text, cta_link, cta_style, overlay_opacity, text_color,
        text_alignment, active, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      section_type, title, subtitle, description, bg_image_url,
      cta_text, cta_link, JSON.stringify(cta_style), overlay_opacity, text_color,
      text_alignment, active, order_index
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
    console.error('Error creating hero section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create hero section' },
      { status: 500 }
    )
  }
}

// PUT /api/home/hero-sections - Update a hero section
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Hero section ID is required' },
        { status: 400 }
      )
    }

    const fields = []
    const params = []

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'cta_style') {
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

    const query = `UPDATE hero_sections SET ${fields.join(', ')} WHERE id = ?`
    
    await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      message: 'Hero section updated successfully'
    })
  } catch (error) {
    console.error('Error updating hero section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update hero section' },
      { status: 500 }
    )
  }
}

// DELETE /api/home/hero-sections - Delete a hero section
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Hero section ID is required' },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM hero_sections WHERE id = ?'
    await pool.execute(query, [id])

    return NextResponse.json({
      success: true,
      message: 'Hero section deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hero section:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero section' },
      { status: 500 }
    )
  }
}
