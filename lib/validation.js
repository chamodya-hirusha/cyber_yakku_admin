import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']).default('ACTIVE'),
  featured: z.boolean().default(false),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  sku: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.any().optional(),
})

export const productCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
})

// Media schemas
export const mediaFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  url: z.string().url('Invalid URL'),
  type: z.string().min(1, 'File type is required'),
  size: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  metadata: z.any().optional(),
})

// Customer schemas
export const customerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid URL').optional(),
  isActive: z.boolean().default(true),
})

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Form validation helpers
export function validateFormData(schema, data) {
  try {
    return { success: true, data: schema.parse(data) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.reduce((acc, err) => {
          const path = err.path.join('.')
          acc[path] = err.message
          return acc
        }, {}),
      }
    }
    throw error
  }
}
