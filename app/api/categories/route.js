import { NextResponse } from 'next/server'

import pool from '@/lib/database'

export async function GET() {
  try {
    // Fetch categories from database
    const [categories] = await pool.execute(`
      SELECT
        id,
        name,
        description,
        created_at as createdAt,
        (SELECT COUNT(*) FROM products WHERE category_id = pc.id) as productCount
      FROM product_categories pc
      ORDER BY order_index ASC, name ASC
    `)
    
    // Organize categories into hierarchy
    const categoryMap = new Map()
    const rootCategories = []
    
    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        icon: getCategoryIcon(category.name)
      })
    })
    
    // Second pass: build hierarchy
    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(categoryMap.get(category.id))
        }
      } else {
        rootCategories.push(categoryMap.get(category.id))
      }
    })
    
    return NextResponse.json({
      success: true,
      data: rootCategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// Helper function to get category icon based on name
function getCategoryIcon(name) {
  const iconMap = {
    'Skins': '🎮',
    'Weapons': '⚔️',
    'Vehicles': '🚗',
    'Currency': '💰',
    'Accessories': '🎯',
    'Armor': '🛡️',
    'Character Skins': '👤',
    'Weapon Skins': '🔪',
    'Swords': '🗡️',
    'Guns': '🔫',
  }
  return iconMap[name] || '📦'
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, parentId, order, columns } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    // Check if category with same name already exists
    const [existing] = await connection.execute(
      'SELECT id FROM product_categories WHERE name = ?',
      [name.trim()]
    )

    if (existing.length > 0) {
      connection.release()
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    // Use common category_items table instead of dynamic tables

    // Insert new category
    const [result] = await connection.execute(`
      INSERT INTO product_categories (name, description, parent_id, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [
      name.trim(),
      description || null,
      parentId || null,
      order || 0
    ])

    const newCategoryId = result.insertId

    // Fetch the created category
    const [rows] = await connection.execute(`
      SELECT
        id,
        name,
        description,
        parent_id as parentId,
        created_at as createdAt,
        (SELECT COUNT(*) FROM products WHERE category_id = pc.id) as productCount
      FROM product_categories pc
      WHERE id = ?
    `, [newCategoryId])

    connection.release()

    const newCategory = {
      ...rows[0],
      children: [],
      icon: getCategoryIcon(rows[0].name)
    }

    return NextResponse.json({
      success: true,
      data: newCategory,
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
