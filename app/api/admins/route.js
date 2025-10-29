
import { NextResponse } from 'next/server';
import pool from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT id, name, email, role, permissions, isActive, lastLogin, createdAt
      FROM admin_users
      ORDER BY createdAt DESC
    `);
    connection.release();

    const formattedAdmins = rows.map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.isActive ? "Active" : "Inactive",
      joinDate: new Date(admin.createdAt).toISOString().split('T')[0],
      lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString().split('T')[0] : "Never",
      permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
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
    const { name, email, password, role, permissions } = body;

    if (!name || !email || !password || !role || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { success: false, error: 'Password must be at least 6 characters long' },
            { status: 400 }
        );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const connection = await pool.getConnection();
    const [result] = await connection.execute(`
      INSERT INTO admin_users (name, email, password, role, permissions, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
    `, [name, email, hashedPassword, role, JSON.stringify(permissions)]);
    connection.release();

    const newAdminId = result.insertId;

    return NextResponse.json({
        success: true,
        data: {
            id: newAdminId,
            name,
            email,
            role,
            permissions
        }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding admin:', error);
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
            { success: false, error: 'An admin with this email already exists.' },
            { status: 409 }
        );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to add administrator' },
      { status: 500 }
    );
  }
}
