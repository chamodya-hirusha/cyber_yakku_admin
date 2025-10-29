import { NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET /api/home/layout - Fetch home page layout
export async function GET(request) {
  try {
    const query = `
      SELECT 
        hl.id,
        hl.section_type,
        hl.section_id,
        hl.order_index,
        hl.active,
        hl.created_at,
        hl.updated_at,
        hs.title as hero_title,
        hs.subtitle as hero_subtitle,
        hs.bg_image_url as hero_bg_image,
        hs.cta_text as hero_cta_text,
        hs.cta_link as hero_cta_link,
        pc.title as carousel_title,
        pc.carousel_type,
        pc.product_ids
      FROM home_layout hl
      LEFT JOIN hero_sections hs ON hl.section_type = 'hero' AND hl.section_id = hs.id
      LEFT JOIN product_carousels pc ON hl.section_type = 'product_carousel' AND hl.section_id = pc.id
      WHERE hl.active = true
      ORDER BY hl.order_index ASC
    `

    const [rows] = await pool.execute(query)

    // Process the layout data
    const layout = rows.map(row => {
      const section = {
        id: row.id,
        type: row.section_type,
        order: row.order_index,
        active: row.active
      }

      // Add section-specific data
      if (row.section_type === 'hero' && row.hero_title) {
        section.data = {
          id: row.section_id,
          title: row.hero_title,
          subtitle: row.hero_subtitle,
          bg_image_url: row.hero_bg_image,
          cta_text: row.hero_cta_text,
          cta_link: row.hero_cta_link
        }
      } else if (row.section_type === 'product_carousel' && row.carousel_title) {
        section.data = {
          id: row.section_id,
          title: row.carousel_title,
          type: row.carousel_type,
          product_ids: JSON.parse(row.product_ids || '[]')
        }
      } else if (row.section_type === 'content_cards') {
        section.data = {
          type: 'content_cards'
        }
      }

      return section
    })

    return NextResponse.json({
      success: true,
      data: layout,
    })
  } catch (error) {
    console.error('Error fetching home layout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch home layout' },
      { status: 500 }
    )
  }
}

// POST /api/home/layout - Update home page layout
export async function POST(request) {
  try {
    const body = await request.json()
    const { sections } = body

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: 'Sections must be an array' },
        { status: 400 }
      )
    }

    // Start transaction
    await pool.execute('START TRANSACTION')

    try {
      // Clear existing layout
      await pool.execute('DELETE FROM home_layout')

      // Insert new layout
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        const query = `
          INSERT INTO home_layout (section_type, section_id, order_index, active)
          VALUES (?, ?, ?, ?)
        `
        await pool.execute(query, [
          section.type,
          section.section_id || null,
          i + 1,
          section.active !== false
        ])
      }

      // Commit transaction
      await pool.execute('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Home layout updated successfully'
      })
    } catch (error) {
      // Rollback transaction
      await pool.execute('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error updating home layout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update home layout' },
      { status: 500 }
    )
  }
}

// PUT /api/home/layout - Reorder sections
export async function PUT(request) {
  try {
    const body = await request.json()
    const { sectionId, newOrder } = body

    if (!sectionId || newOrder === undefined) {
      return NextResponse.json(
        { success: false, error: 'Section ID and new order are required' },
        { status: 400 }
      )
    }

    const query = 'UPDATE home_layout SET order_index = ? WHERE id = ?'
    await pool.execute(query, [newOrder, sectionId])

    return NextResponse.json({
      success: true,
      message: 'Section order updated successfully'
    })
  } catch (error) {
    console.error('Error updating section order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update section order' },
      { status: 500 }
    )
  }
}

