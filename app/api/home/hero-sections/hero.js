import { NextResponse } from 'next/server'
import pool from '@/lib/database'
import { headers } from 'next/headers';

// Input validation functions
function validateHeroSectionData(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.section_type?.trim()) errors.push('Section type is required');
  }
  
  if (data.title && data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }
  
  if (data.subtitle && data.subtitle.length > 255) {
    errors.push('Subtitle must be 255 characters or less');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (data.bg_image_url && !/^https?:\/\/.+/.test(data.bg_image_url)) {
    errors.push('Background image URL must be a valid HTTP(S) URL');
  }
  
  if (data.cta_link && !/^https?:\/\/.+/.test(data.cta_link)) {
    errors.push('CTA link must be a valid HTTP(S) URL');
  }
  
  if (data.text_color && !/^#[0-9A-Fa-f]{6}$/.test(data.text_color)) {
    errors.push('Text color must be a valid hex color code');
  }
  
  if (data.text_alignment && !['left', 'center', 'right'].includes(data.text_alignment)) {
    errors.push('Text alignment must be one of: left, center, right');
  }
  
  if (data.overlay_opacity && (typeof data.overlay_opacity !== 'number' || data.overlay_opacity < 0 || data.overlay_opacity > 1)) {
    errors.push('Overlay opacity must be a number between 0 and 1');
  }
  
  if (data.order_index && (typeof data.order_index !== 'number' || data.order_index < 0)) {
    errors.push('Order index must be a non-negative number');
  }
  
  return errors;
}

// Safe JSON parsing
function safeJsonParse(jsonString, defaultValue = null) {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, error);
    return defaultValue;
  }
}

// GET /api/home/hero-sections - Fetch all hero sections
export async function GET(request) {
  // Ensure the request is expecting JSON
  const acceptHeader = headers().get('accept');
  if (!acceptHeader?.includes('application/json')) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Request must accept application/json' }),
      { status: 406, headers: { 'Content-Type': 'application/json' } }
    );
  }

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

    if (active !== null && active !== undefined) {
      query += ' AND active = ?'
      params.push(active === 'true')
    }

    query += ' ORDER BY order_index ASC, created_at ASC'

    const [rows] = await pool.execute(query, params)

    // Parse JSON fields safely
    const processedRows = rows.map(row => ({
      ...row,
      cta_style: safeJsonParse(row.cta_style, null),
      active: Boolean(row.active)
    }))

    return NextResponse.json({
      success: true,
      data: processedRows,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching hero sections:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hero sections',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/home/hero-sections - Create a new hero section
export async function POST(request) {
  // Ensure the request is expecting JSON
  const acceptHeader = headers().get('accept');
  if (!acceptHeader?.includes('application/json')) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Request must accept application/json' }),
      { status: 406, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    const validationErrors = validateHeroSectionData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed: ' + validationErrors.join(', '),
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
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
      section_type.trim(),
      title.trim(),
      subtitle?.trim() || null,
      description?.trim() || null,
      bg_image_url?.trim() || null,
      cta_text?.trim() || null,
      cta_link?.trim() || null,
      safeJsonParse(cta_style, null) ? JSON.stringify(cta_style) : null,
      overlay_opacity,
      text_color?.trim() || null,
      text_alignment || 'center',
      Boolean(active),
      order_index
    ]

    const [result] = await pool.execute(query, params)

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating hero section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create hero section',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// PUT /api/home/hero-sections - Update a hero section
export async function PUT(request) {
  // Ensure the request is expecting JSON
  const acceptHeader = headers().get('accept');
  if (!acceptHeader?.includes('application/json')) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Request must accept application/json' }),
      { status: 406, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hero section ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const validationErrors = validateHeroSectionData(body, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed: ' + validationErrors.join(', '),
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Whitelist of allowed fields to prevent SQL injection
    const allowedFields = [
      'section_type', 'title', 'subtitle', 'description', 'bg_image_url',
      'cta_text', 'cta_link', 'cta_style', 'overlay_opacity', 'text_color',
      'text_alignment', 'active', 'order_index'
    ];

    for (const key in updateData) {
      if (!allowedFields.includes(key)) {
        console.warn(`Attempted to update a non-whitelisted field: ${key}`);
        delete updateData[key]; // Remove non-whitelisted field
      }
    }

    const fields = []
    const params = []

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'cta_style') {
        fields.push(`${key} = ?`)
        params.push(safeJsonParse(value, null) ? JSON.stringify(value) : null)
      } else if (typeof value === 'string') {
        fields.push(`${key} = ?`)
        params.push(value.trim() || null)
      } else {
        fields.push(`${key} = ?`)
        params.push(value)
      }
    })

    if (fields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    const query = `UPDATE hero_sections SET ${fields.join(', ')} WHERE id = ?`
    
    const result = await pool.execute(query, params)

    if (result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hero section not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Hero section updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating hero section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update hero section',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// DELETE /api/home/hero-sections - Delete a hero section
export async function DELETE(request) {
  // Ensure the request is expecting JSON
  const acceptHeader = headers().get('accept');
  if (!acceptHeader?.includes('application/json')) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Request must accept application/json' }),
      { status: 406, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hero section ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM hero_sections WHERE id = ?'
    const result = await pool.execute(query, [id])

    if (result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hero section not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Hero section deleted successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error deleting hero section:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete hero section',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
