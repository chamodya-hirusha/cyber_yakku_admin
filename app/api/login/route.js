"use server";
import { NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    let rows;
    try {
      // Try selecting optional columns if they exist
      [rows] = await connection.execute(`
        SELECT 
          id,
          fullname AS name,
          email,
          role,
          /* prefer status, fall back to stusta */
          COALESCE(status, stusta) AS status,
          /* support multiple naming styles */
          COALESCE(joinDate, joindate, created_at) AS joinDate,
          COALESCE(lastLogin, lastlogin, last_login) AS lastLogin,
          permissions
        FROM admin
        ORDER BY id DESC
      `);
    } catch (err) {
      // Fallback for schemas without status column
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        [rows] = await connection.execute(`
          SELECT id, fullname AS name, email
          FROM admin
          ORDER BY id DESC
        `);
      } else {
        throw err;
      }
    }
    connection.release();

    const formattedAdmins = rows.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'Admin',
      status: typeof admin.status === 'number' || typeof admin.status === 'boolean'
        ? Boolean(admin.status)
        : true,
      joinDate: admin.joinDate ? new Date(admin.joinDate).toISOString().split('T')[0] : '',
      lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString().split('T')[0] : '',
      permissions: (() => {
        if (!admin.permissions) return [];
        if (typeof admin.permissions === 'string') {
          try {
            const parsed = JSON.parse(admin.permissions);
            return Array.isArray(parsed) ? parsed : String(admin.permissions).split(',').map(p => p.trim()).filter(Boolean);
          } catch {
            return String(admin.permissions).split(',').map(p => p.trim()).filter(Boolean);
          }
        }
        return Array.isArray(admin.permissions) ? admin.permissions : [];
      })(),
    }));

    return NextResponse.json({ success: true, data: formattedAdmins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch administrators' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM admin WHERE email = ? LIMIT 1',
        [email]
      );

      // Check if admin exists and password matches
      if (!rows.length || rows[0].password !== password) {
        connection.release();
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      // Check if admin is active (only update lastLogin if admin is active)
      const adminStatus = rows[0].status !== undefined ? rows[0].status : (rows[0].stusta !== undefined ? rows[0].stusta : 1);
      const isActive = adminStatus === 1 || adminStatus === true;
      
      if (!isActive) {
        connection.release();
        return NextResponse.json(
          { success: false, error: 'Your account is inactive. Please contact an administrator.' },
          { status: 403 }
        );
      }

      // Only update lastLogin AFTER successful authentication
      // Update last login time - detect the correct column name
      try {
        // First, detect which columns exist in the admin table
        let availableColumns = {};
        try {
          const [columns] = await connection.execute(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'admin'
          `);
          columns.forEach(col => {
            availableColumns[col.COLUMN_NAME.toLowerCase()] = col.COLUMN_NAME;
          });
        } catch (schemaErr) {
          console.warn('Could not query schema for login update:', schemaErr.message);
        }
        
        // Find the last login column name
        const lastLoginColumn = availableColumns['lastlogin'] ||
                               availableColumns['last_login'] ||
                               availableColumns['lastlogindate'] ||
                               availableColumns['lastlogintime'] ||
                               'lastLogin'; // fallback to most common
        
        if (lastLoginColumn && availableColumns[lastLoginColumn.toLowerCase()]) {
          await connection.execute(
            `UPDATE admin SET ${lastLoginColumn} = CURRENT_TIMESTAMP WHERE id = ?`,
            [rows[0].id]
          );
        }
      } catch (updateError) {
        // Log error but don't fail login if lastLogin update fails
        console.warn('Could not update last login time:', updateError);
      }

      return NextResponse.json({
        success: true,
        data: {
          token: 'your-token-generation-here', // You should implement proper token generation
          user: {
            id: rows[0].id,
            name: rows[0].fullname,
            email: rows[0].email,
            role: rows[0].role || 'Admin'
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
