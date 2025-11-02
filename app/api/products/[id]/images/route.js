import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const connection = await pool.getConnection()

    // Fetch all images for the product
    const [images] = await connection.execute(
      'SELECT image_url, is_main, uploaded_at FROM product_image WHERE product_product_id = ? ORDER BY is_main DESC',
      [id]
    )

    connection.release()

    return NextResponse.json({
      success: true,
      data: images || []
    })
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch product images: ${error.message}` },
      { status: 500 }
    )
  }
}

