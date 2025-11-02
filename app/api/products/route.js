import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const connection = await pool.getConnection()

    // Fetch products with joined data and main image
    const [products] = await connection.execute(`
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.category_id,
        p.type_id,
        p.brand_id,
        p.model_id,
        p.price,
        p.discount,
        p.stock_quantity,
        p.pid,
        p.featured,
        p.status,
        p.tags,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        t.type_name,
        b.name as brand_name,
        m.name as model_name,
        (SELECT image_url FROM product_image WHERE product_product_id = p.product_id AND is_main = 1 LIMIT 1) as image_url
      FROM product p
      LEFT JOIN Category c ON p.category_id = c.id
      LEFT JOIN type t ON p.type_id = t.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN model m ON p.model_id = m.id
      ORDER BY p.created_at DESC
    `)

    connection.release()

    return NextResponse.json({
      success: true,
      data: products || []
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch products: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category_id,
      type_id,
      brand_id,
      model_id,
      price,
      discount = 0,
      stock_quantity = 0,
      pid,
      featured = false,
      image_url,
      status = 'draft',
      tags = []
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (!category_id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    try {
      // Insert product (image_url is stored in product_image table, not in product table)
      const query = `
       INSERT INTO product (
        name, description, category_id, type_id, brand_id, model_id,
        price, discount, stock_quantity, pid, featured, status, tags, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `


      // Convert tags array to JSON string if it's an array, otherwise use as is
      const tagsValue = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]')

      const values = [
        name.trim(),
        description?.trim() || null,
        parseInt(category_id),
        type_id ? parseInt(type_id) : null,
        brand_id ? parseInt(brand_id) : null,
        model_id ? parseInt(model_id) : null,
        parseFloat(price) || 0,
        parseFloat(discount) || 0,
        parseInt(stock_quantity) || 0,
        pid?.trim() || null,
        Boolean(featured),
        status,
        tagsValue
      ]

      const [result] = await connection.execute(query, values)
      const productId = result.insertId

      // If image_url is provided, insert into product_image table
      if (image_url && image_url.trim()) {
        const imageQuery = `
          INSERT INTO product_image (product_product_id, image_url, is_main, uploaded_at)
          VALUES (?, ?, ?, NOW())
        `
        await connection.execute(imageQuery, [productId, image_url.trim(), true])
      }

      connection.release()

      return NextResponse.json({
        success: true,
        message: 'Product created successfully',
        data: { product_id: productId }
      })
    } catch (dbError) {
      connection.release()
      console.error('Database error:', dbError)

      // Handle duplicate entry
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { success: false, error: 'Product with this name or PID already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: `Failed to create product: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: `Failed to create product: ${error.message}` },
      { status: 500 }
    )
  }
}

