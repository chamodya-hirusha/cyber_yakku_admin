import { NextResponse } from 'next/server'
import pool from '@/lib/database'
import { headers } from 'next/headers';

// Input validation functions
function validateContentCardData(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.title?.trim()) errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (data.image_url && !/^https?:\/\/.+/.test(data.image_url)) {
    errors.push('Image URL must be a valid HTTP(S) URL');
  }
  
  if (data.link && !/^https?:\/\/.+/.test(data.link)) {
    errors.push('Link must be a valid HTTP(S) URL');
  }
  
  if (data.link_target && !['_self', '_blank', '_parent', '_top'].includes(data.link_target)) {
    errors.push('Link target must be one of: _self, _blank, _parent, _top');
  }
  
  if (data.badge_color && !/^#[0-9A-Fa-f]{6}$/.test(data.badge_color)) {
    errors.push('Badge color must be a valid hex color code');
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

// GET /api/home/content-cards - Fetch all content cards
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

    if (active !== null && active !== undefined) {
      query += ' AND active = ?'
      params.push(active === 'true')
    }

    query += ' ORDER BY order_index ASC, created_at ASC'

    const [rows] = await pool.execute(query, params)

    // Parse JSON fields safely
    const processedRows = rows.map(row => ({
      ...row,
      card_style: safeJsonParse(row.card_style, null),
      active: Boolean(row.active)
    }))

    return NextResponse.json({
      success: true,
      data: processedRows,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching content cards:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content cards',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/home/content-cards - Create a new content card
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
    
    const validationErrors = validateContentCardData(body);
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
      title.trim(),
      description?.trim() || null,
      image_url?.trim() || null,
      link?.trim() || null,
      link_target,
      safeJsonParse(card_style, null) ? JSON.stringify(card_style) : null,
      icon?.trim() || null,
      badge_text?.trim() || null,
      badge_color,
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
    console.error('Error creating content card:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content card',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// PUT /api/home/content-cards - Update a content card
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
          error: 'Content card ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const validationErrors = validateContentCardData(body, true);
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
      'title', 'description', 'image_url', 'link', 'link_target',
      'card_style', 'icon', 'badge_text', 'badge_color', 'active', 'order_index'
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
      if (key === 'card_style') {
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

    const query = `UPDATE content_cards SET ${fields.join(', ')} WHERE id = ?`
    
    const result = await pool.execute(query, params)

    if (result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content card not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Content card updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating content card:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update content card',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// DELETE /api/home/content-cards - Delete a content card
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
          error: 'Content card ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM content_cards WHERE id = ?'
    const result = await pool.execute(query, [id])

    if (result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content card not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Content card deleted successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error deleting content card:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content card',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
