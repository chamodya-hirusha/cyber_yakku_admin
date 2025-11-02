import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request, { params }) {
  try {
    const { categoryId } = await params
    const connection = await pool.getConnection()

    // Fetch data from all four tables based on category_id with joined names
    const [vehicles] = await connection.execute(`
      SELECT 
        v.vehicle_id,
        v.name,
        COALESCE(b.name, '') as brand_name,
        COALESCE(m.name, '') as model_name,
        COALESCE(t.type_name, '') as type_name,
        COALESCE(c.name, '') as category_name
      FROM vehicle v
      LEFT JOIN brand b ON v.brand_id = b.id
      LEFT JOIN model m ON v.model_id = m.id
      LEFT JOIN type t ON v.type_id = t.id
      LEFT JOIN Category c ON v.category_id = c.id
      WHERE v.category_id = ?
      ORDER BY v.vehicle_id DESC
    `, [categoryId])

    const [weapons] = await connection.execute(`
      SELECT 
        w.weapon_id,
        w.name,
        COALESCE(m.name, '') as model_name,
        COALESCE(b.name, '') as brand_name,
        COALESCE(t.type_name, '') as type_name,
        COALESCE(c.name, '') as category_name
      FROM weapon w
      LEFT JOIN model m ON w.model_id = m.id
      LEFT JOIN brand b ON w.brand_id = b.id
      LEFT JOIN type t ON w.type_id = t.id
      LEFT JOIN Category c ON w.category_id = c.id
      WHERE w.category_id = ?
      ORDER BY w.weapon_id DESC
    `, [categoryId])

    const [skins] = await connection.execute(`
      SELECT 
        s.skin_id,
        s.name,
        COALESCE(b.name, '') as brand_name,
        COALESCE(m.name, '') as model_name,
        COALESCE(t.type_name, '') as type_name,
        COALESCE(c.name, '') as category_name
      FROM skin s
      LEFT JOIN brand b ON s.brand_id = b.id
      LEFT JOIN model m ON s.model_id = m.id
      LEFT JOIN type t ON s.type_id = t.id
      LEFT JOIN Category c ON s.category_id = c.id
      WHERE s.category_id = ?
      ORDER BY s.skin_id DESC
    `, [categoryId])

    const [currencies] = await connection.execute(`
      SELECT 
        cu.currency_id,
        cu.name,
        COALESCE(t.type_name, '') as type_name,
        COALESCE(c.name, '') as category_name
      FROM currency cu
      LEFT JOIN type t ON cu.type_id = t.id
      LEFT JOIN Category c ON cu.category_id = c.id
      WHERE cu.category_id = ?
      ORDER BY cu.currency_id DESC
    `, [categoryId])

    connection.release()

    return NextResponse.json({
      success: true,
      data: {
        vehicles: vehicles || [],
        weapons: weapons || [],
        skins: skins || [],
        currencies: currencies || []
      }
    })
  } catch (error) {
    console.error('Error fetching category items:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch items: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { categoryId } = await params
    const body = await request.json()
    const { tableType, name, brand_id, model_id, type_id, item_id } = body

    if (!tableType || !name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Table type and name are required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    let result
    let query
    let values

    try {
      switch (tableType) {
        case 'vehicle':
          if (item_id) {
            query = `INSERT INTO vehicle (vehicle_id, name, brand_id, model_id, type_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`
            values = [
              parseInt(item_id),
              name.trim(),
              brand_id || null,
              model_id || null,
              type_id || null,
              categoryId
            ]
          } else {
            query = `INSERT INTO vehicle (name, brand_id, model_id, type_id, category_id) VALUES (?, ?, ?, ?, ?)`
            values = [
              name.trim(),
              brand_id || null,
              model_id || null,
              type_id || null,
              categoryId
            ]
          }
          break

        case 'weapon':
          if (item_id) {
            query = `INSERT INTO weapon (weapon_id, name, model_id, brand_id, type_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`
            values = [
              parseInt(item_id),
              name.trim(),
              model_id || null,
              brand_id || null,
              type_id || null,
              categoryId
            ]
          } else {
            query = `INSERT INTO weapon (name, model_id, brand_id, type_id, category_id) VALUES (?, ?, ?, ?, ?)`
            values = [
              name.trim(),
              model_id || null,
              brand_id || null,
              type_id || null,
              categoryId
            ]
          }
          break

        case 'skin':
          if (item_id) {
            query = `INSERT INTO skin (skin_id, name, brand_id, model_id, type_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`
            values = [
              parseInt(item_id),
              name.trim(),
              brand_id || null,
              model_id || null,
              type_id || null,
              categoryId
            ]
          } else {
            query = `INSERT INTO skin (name, brand_id, model_id, type_id, category_id) VALUES (?, ?, ?, ?, ?)`
            values = [
              name.trim(),
              brand_id || null,
              model_id || null,
              type_id || null,
              categoryId
            ]
          }
          break

        case 'currency':
          if (item_id) {
            query = `INSERT INTO currency (currency_id, name, type_id, category_id) VALUES (?, ?, ?, ?)`
            values = [
              parseInt(item_id),
              name.trim(),
              type_id || null,
              categoryId
            ]
          } else {
            query = `INSERT INTO currency (name, type_id, category_id) VALUES (?, ?, ?)`
            values = [
              name.trim(),
              type_id || null,
              categoryId
            ]
          }
          break

        default:
          connection.release()
          return NextResponse.json(
            { success: false, error: 'Invalid table type. Must be: vehicle, weapon, skin, or currency' },
            { status: 400 }
          )
      }

      [result] = await connection.execute(query, values)
      connection.release()

      return NextResponse.json({
        success: true,
        message: `${tableType} created successfully`,
        data: { id: item_id || result.insertId }
      })
    } catch (dbError) {
      connection.release()
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: `Failed to create ${tableType}: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { success: false, error: `Failed to create item: ${error.message}` },
      { status: 500 }
    )
  }
}

