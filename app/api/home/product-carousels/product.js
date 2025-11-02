import { NextResponse } from 'next/server'
import pool from '@/lib/database'
import { headers } from 'next/headers';

// Input validation functions
function validateProductCarouselData(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.carousel_type?.trim()) errors.push('Carousel type is required');
  }
  
  if (data.title && data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (data.display_limit && (typeof data.display_limit !== 'number' || data.display_limit < 1 || data.display_limit > 100)) {
    errors.push('Display limit must be a number between 1 and 100');
  }
  
  if (data.auto_play_speed && (typeof data.auto_play_speed !== 'number' || data.auto_play_speed < 1000 || data.auto_play_speed > 10000)) {
    errors.push('Auto play speed must be a number between 1000 and 10000 milliseconds');
  }
  
  if (data.order_index && (typeof data.order_index !== 'number' || data.order_index < 0)) {
    errors.push('Order index must be a non-negative number');
  }
  
  if (data.product_ids && !Array.isArray(data.product_ids)) {
    errors.push('Product IDs must be an array');
  }
  
  if (data.product_ids && data.product_ids.some(id => typeof id !== 'number' && typeof id !== 'string')) {
    errors.push('All product IDs must be numbers or strings');
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

// GET /api/home/product-carousels - Fetch all product carousels
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

    if (active !== null && active !== undefined) {
      query += ' AND active = ?'
      params.push(active === 'true')
    }

    query += ' ORDER BY order_index ASC, created_at ASC'

    const [rows] = await pool.execute(query, params)

    // Parse JSON fields safely
    const processedRows = rows.map(row => ({
      ...row,
      product_ids: safeJsonParse(row.product_ids, []),
      card_style: safeJsonParse(row.card_style, null),
      auto_play: Boolean(row.auto_play),
      show_dots: Boolean(row.show_dots),
      show_arrows: Boolean(row.show_arrows),
      active: Boolean(row.active)
    }))

    return NextResponse.json({
      success: true,
      data: processedRows,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching product carousels:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product carousels',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/home/product-carousels - Create a new product carousel
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
    
    const validationErrors = validateProductCarouselData(body);
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
      title.trim(),
      description?.trim() || null,
      icon?.trim() || null,
      carousel_type.trim(),
      JSON.stringify(Array.isArray(product_ids) ? product_ids : []),
      display_limit,
      Boolean(auto_play),
      auto_play_speed,
      Boolean(show_dots),
      Boolean(show_arrows),
      safeJsonParse(card_style, null) ? JSON.stringify(card_style) : null,
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
    console.error('Error creating product carousel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product carousel',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// PUT /api/home/product-carousels - Update a product carousel
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
          error: 'Product carousel ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const validationErrors = validateProductCarouselData(body, true);
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
      'title', 'description', 'icon', 'carousel_type', 'product_ids',
      'display_limit', 'auto_play', 'auto_play_speed', 'show_dots',
      'show_arrows', 'card_style', 'active', 'order_index'
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
      if (key === 'product_ids' || key === 'card_style') {
        fields.push(`${key} = ?`)
        if (key === 'product_ids') {
          params.push(JSON.stringify(Array.isArray(value) ? value : []))
        } else {
          params.push(safeJsonParse(value, null) ? JSON.stringify(value) : null)
        }
      } else if (typeof value === 'string') {
        fields.push(`${key} = ?`)
        params.push(value.trim() || null)
      } else if (typeof value === 'boolean') {
        fields.push(`${key} = ?`)
        params.push(Boolean(value))
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

    const query = `UPDATE product_carousels SET ${fields.join(', ')} WHERE id = ?`
    
    const result = await pool.execute(query, params)

    if (result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product carousel not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product carousel updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating product carousel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product carousel',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// DELETE /api/home/product-carousels - Delete a product carousel
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
          error: 'Product carousel ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const query = 'DELETE FROM product_carousels WHERE id = ?'
    const result = await pool.execute(query, [id])

    if (result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product carousel not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product carousel deleted successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error deleting product carousel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product carousel',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
