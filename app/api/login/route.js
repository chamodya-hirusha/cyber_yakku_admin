import { NextResponse } from 'next/server';
import pool from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, validateFormData } from '@/lib/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, name, email, password, role, permissions, is_active FROM admin_users WHERE email = ?',
        [email]
      );
      connection.release();

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const user = rows[0];

      if (!user.is_active) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated' },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions ? JSON.parse(user.permissions) : []
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      const updateConnection = await pool.getConnection();
      try {
        await updateConnection.execute(
          'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );
      } finally {
        updateConnection.release();
      }

      // Create session
      const sessionConnection = await pool.getConnection();
      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await sessionConnection.execute(
          'INSERT INTO user_sessions (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())',
          [user.id, token, expiresAt]
        );
      } finally {
        sessionConnection.release();
      }

      return NextResponse.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions ? JSON.parse(user.permissions) : []
          }
        }
      });
    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}