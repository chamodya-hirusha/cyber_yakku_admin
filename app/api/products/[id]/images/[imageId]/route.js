import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function DELETE(request, { params }) {
  try {
    const { id, imageId } = params
    const connection = await pool.getConnection()

    try {
      // Check if image belongs to the product (decode URL parameter)
      const decodedImageUrl = decodeURIComponent(imageId)
      const [images] = await connection.execute(
        'SELECT is_main FROM product_image WHERE image_url = ? AND product_product_id = ?',
        [decodedImageUrl, id]
      )

      if (images.length === 0) {
        connection.release()
        return NextResponse.json(
          { success: false, error: 'Image not found' },
          { status: 404 }
        )
      }

      const deletedImage = images[0]
      const wasMain = deletedImage.is_main

      // Delete the image
      const [result] = await connection.execute(
        'DELETE FROM product_image WHERE image_url = ? AND product_product_id = ?',
        [decodedImageUrl, id]
      )

      // If the deleted image was the main image, make the first remaining image the main
      if (wasMain) {
        const [remainingImages] = await connection.execute(
          'SELECT image_url FROM product_image WHERE product_product_id = ? LIMIT 1',
          [id]
        )

        if (remainingImages.length > 0) {
          await connection.execute(
            'UPDATE product_image SET is_main = 1 WHERE image_url = ? AND product_product_id = ?',
            [remainingImages[0].image_url, id]
          )
        }
      }

      connection.release()

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, error: 'Image not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      })
    } catch (dbError) {
      connection.release()
      console.error('Database error:', dbError)

      return NextResponse.json(
        { success: false, error: `Failed to delete image: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { success: false, error: `Failed to delete image: ${error.message}` },
      { status: 500 }
    )
  }
}

