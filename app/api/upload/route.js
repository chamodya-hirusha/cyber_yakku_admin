import { NextResponse } from 'next/server'

const MAX_IMAGE_DIMENSION = 1920 
const JPEG_QUALITY = 80 

async function compressImage(buffer, mimeType) {
  try {
    // Try to use sharp if available (better compression)
    let sharp
    try {
      sharp = (await import('sharp')).default
    } catch {
      // Sharp not available, use basic approach
      return compressImageBasic(buffer, mimeType)
    }

    let image = sharp(buffer)
    const metadata = await image.metadata()

    // Resize if image is too large
    if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
      image = image.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    // Compress based on image type
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      image = image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    } else if (mimeType === 'image/png') {
      image = image.png({ quality: 80, compressionLevel: 9 })
    } else if (mimeType === 'image/webp') {
      image = image.webp({ quality: 80 })
    }

    const compressedBuffer = await image.toBuffer()
    return compressedBuffer
  } catch (error) {
    console.warn('Sharp compression failed, using basic approach:', error)
    return compressImageBasic(buffer, mimeType)
  }
}

/**
 * Basic image compression fallback - just return original if sharp not available
 * In production, you should install sharp: npm install sharp
 */
function compressImageBasic(buffer, mimeType) {
  // Without sharp, we can't compress easily, so just return original
  // The size limit validation will catch oversized images
  return buffer
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.' },
        { status: 400 }
      )
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)

    // Compress and resize image
    try {
      buffer = await compressImage(buffer, file.type)
    } catch (compressionError) {
      console.warn('Image compression failed, using original:', compressionError)
      // Continue with original buffer
    }

    // Convert to base64
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        filename: file.name,
        type: file.type,
        size: buffer.length
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: `Failed to upload file: ${error.message}` },
      { status: 500 }
    )
  }
}

