import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const connection = await pool.getConnection()

    // Fetch product with all related data
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
      WHERE p.product_id = ?
    `, [id])

    connection.release()

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: products[0]
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch product: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      name,
      description,
      category_id,
      type_id,
      brand_id,
      model_id,
      price,
      discount,
      stock_quantity,
      pid,
      featured,
      image_url,
      images = [],
      status,
      tags,
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

    // Validate that at least one image is provided
    const imagesToCheck = []
    if (Array.isArray(images) && images.length > 0) {
      imagesToCheck.push(...images.filter(img => img && img.trim()))
    }
    if (image_url && image_url.trim()) {
      imagesToCheck.push(image_url.trim())
    }

    // For update, check if there are existing images if no new images provided
    if (imagesToCheck.length === 0) {
      // Check if product has existing images
      const connection = await pool.getConnection()
      try {
        const [existingImages] = await connection.execute(
          'SELECT id FROM product_image WHERE product_product_id = ? LIMIT 1',
          [id]
        )
        
        if (existingImages.length === 0) {
          connection.release()
          return NextResponse.json(
            { success: false, error: 'At least one product image is required. Please add an image or keep existing images.' },
            { status: 400 }
          )
        }
        // If existing images found, allow update without new images
      } catch (checkError) {
        connection.release()
        return NextResponse.json(
          { success: false, error: 'At least one product image is required' },
          { status: 400 }
        )
      }
      connection.release()
    }

    const connection = await pool.getConnection()

    try {
      // Convert tags array to JSON string if it's an array, otherwise use as is
      const tagsValue = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]')

      // Try to update with SEO fields first, fallback to basic update if columns don't exist
      let query, values, result
      
      try {
        // Update product with SEO fields
        query = `
          UPDATE product SET 
            name = ?, description = ?, category_id = ?, type_id = ?, brand_id = ?, model_id = ?,
            price = ?, discount = ?, stock_quantity = ?, pid = ?, featured = ?, status = ?, tags = ?,
            meta_title = ?, meta_description = ?, meta_keywords = ?, og_image_url = ?, updated_at = NOW()
          WHERE product_id = ?
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
          og_image_url?.trim() || null,
          id
        ]

        [result] = await connection.execute(query, values)
      } catch (seoError) {
        // If SEO columns don't exist, use basic update without SEO fields
        if (seoError.code === 'ER_BAD_FIELD_ERROR') {
          query = `
            UPDATE product SET 
              name = ?, description = ?, category_id = ?, type_id = ?, brand_id = ?, model_id = ?,
              price = ?, discount = ?, stock_quantity = ?, pid = ?, featured = ?, status = ?, tags = ?,
              updated_at = NOW()
            WHERE product_id = ?
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
            id
          ]

          [result] = await connection.execute(query, values)
        } else {
          throw seoError
        }
      }

      // Handle images - support both single image_url and multiple images array
      const imagesToInsert = imagesToCheck.length > 0 ? imagesToCheck : []
      
      // Update images: Delete all existing images and insert new ones
      // Only update if new images are provided, otherwise keep existing
      if (imagesToInsert.length > 0) {
        // Delete all existing images for this product
        await connection.execute(
          'DELETE FROM product_image WHERE product_product_id = ?',
          [id]
        )

        // Insert new images
        if (imagesToInsert.length > 0) {
          const imageQuery = `
            INSERT INTO product_image (product_product_id, image_url, is_main, uploaded_at)
            VALUES (?, ?, ?, NOW())
          `
          // First image is marked as main
          for (let i = 0; i < imagesToInsert.length; i++) {
            const imageUrl = imagesToInsert[i]
            
            try {
              await connection.execute(imageQuery, [id, imageUrl, i === 0])
            } catch (imageError) {
              connection.release()
              throw imageError
            }
          }
        }
      }

      connection.release()

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Product updated successfully'
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
        { success: false, error: `Failed to update product: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: `Failed to update product: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const connection = await pool.getConnection()

    try {
      // First, delete related product images
      await connection.execute('DELETE FROM product_image WHERE product_product_id = ?', [id])
      
      // Then delete the product
      const [result] = await connection.execute('DELETE FROM product WHERE product_id = ?', [id])

      connection.release()

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Product deleted successfully'
      })
    } catch (dbError) {
      connection.release()
      console.error('Database error:', dbError)

      return NextResponse.json(
        { success: false, error: `Failed to delete product: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: `Failed to delete product: ${error.message}` },
      { status: 500 }
    )
  }
}