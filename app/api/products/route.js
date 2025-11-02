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
      images = [],
      status = 'draft',
      tags = [],
      meta_title,
      meta_description,
      meta_keywords,
      og_image_url
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

    // Validate and collect images
    const imagesToInsert = []
    
    // First, check images array (takes priority)
    if (Array.isArray(images) && images.length > 0) {
      // Filter out empty strings and null values
      const validImages = images.filter(img => img && typeof img === 'string' && img.trim())
      if (validImages.length > 0) {
        imagesToInsert.push(...validImages.map(img => img.trim()))
      }
    }
    
    // Then check image_url (if no images array or array is empty)
    if (imagesToInsert.length === 0 && image_url && typeof image_url === 'string' && image_url.trim()) {
      imagesToInsert.push(image_url.trim())
    }

    // Validate that at least one image is provided
    if (imagesToInsert.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one product image is required' },
        { status: 400 }
      )
    }

    console.log('Creating product with images:', {
      productName: name,
      imagesCount: imagesToInsert.length,
      imagesReceived: {
        imagesArray: Array.isArray(images) ? images.length : 'not array',
        imageUrl: image_url ? 'provided' : 'not provided',
        imagesInserting: imagesToInsert.map((img, i) => `${i + 1}: ${img.substring(0, 50)}...`)
      }
    })

    const connection = await pool.getConnection()

    try {
      // Convert tags array to JSON string if it's an array, otherwise use as is
      const tagsValue = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]')

      // Try to insert with SEO fields first, fallback to basic insert if columns don't exist
      let query, values, result
      
      try {
        // Insert product with SEO fields
        query = `
         INSERT INTO product (
          name, description, category_id, type_id, brand_id, model_id,
          price, discount, stock_quantity, pid, featured, status, tags, 
          meta_title, meta_description, meta_keywords, og_image_url,
          created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `

        values = [
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
          tagsValue,
          meta_title?.trim() || null,
          meta_description?.trim() || null,
          meta_keywords?.trim() || null,
          og_image_url?.trim() || null
        ]

        [result] = await connection.execute(query, values)
      } catch (seoError) {
        // If SEO columns don't exist, use basic insert without SEO fields
        if (seoError.code === 'ER_BAD_FIELD_ERROR') {
          query = `
           INSERT INTO product (
            name, description, category_id, type_id, brand_id, model_id,
            price, discount, stock_quantity, pid, featured, status, tags,
            created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `

          values = [
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

          [result] = await connection.execute(query, values)
        } else {
          throw seoError
        }
      }
      const productId = result.insertId

      console.log(`Product created with ID: ${productId}, preparing to insert ${imagesToInsert.length} images`)

      // Insert all images into product_image table
      if (imagesToInsert.length > 0) {
        const imageQuery = `
          INSERT INTO product_image (product_product_id, image_url, is_main, uploaded_at)
          VALUES (?, ?, ?, NOW())
        `
        // First image is marked as main
        for (let i = 0; i < imagesToInsert.length; i++) {
          const imageUrl = imagesToInsert[i]
          
          try {
            console.log(`Inserting image ${i + 1}/${imagesToInsert.length} for product ${productId}`, {
              isMain: i === 0,
              imageUrlLength: imageUrl.length,
              imageUrlPreview: imageUrl.substring(0, 100) + '...'
            })
            const [imageResult] = await connection.execute(imageQuery, [productId, imageUrl, i === 0])
            console.log(`Image ${i + 1} inserted successfully, ID: ${imageResult.insertId}`)
          } catch (imageError) {
            console.error(`Error inserting image ${i + 1}:`, imageError)
            connection.release()
            throw imageError
          }
        }
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

