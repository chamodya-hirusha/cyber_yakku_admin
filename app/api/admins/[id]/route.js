import { NextResponse } from 'next/server';
import pool from '@/lib/database';
import bcrypt from 'bcryptjs';

// PUT /api/admins/[id] - Update an admin
export async function PUT(request, { params }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { name, email, password, role, permissions } = body;

        if (!name || !email || !role || !permissions || permissions.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Please fill in all required fields' },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();

        if (password) {
            if (password.length < 6) {
                return NextResponse.json(
                    { success: false, error: 'Password must be at least 6 characters long' },
                    { status: 400 }
                );
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await connection.execute(`
                UPDATE admin_users
                SET name = ?, email = ?, role = ?, permissions = ?, password = ?, updatedAt = NOW()
                WHERE id = ?
            `, [name, email, role, JSON.stringify(permissions), hashedPassword, id]);
        } else {
            await connection.execute(`
                UPDATE admin_users
                SET name = ?, email = ?, role = ?, permissions = ?, updatedAt = NOW()
                WHERE id = ?
            `, [name, email, role, JSON.stringify(permissions), id]);
        }

        connection.release();

        return NextResponse.json({
            success: true,
            data: { id, name, email, role, permissions }
        });

    } catch (error) {
        console.error(`Error updating admin ${id}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { success: false, error: 'An admin with this email already exists.' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update administrator' },
            { status: 500 }
        );
    }
}

// DELETE /api/admins/[id] - Delete an admin
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM admin_users WHERE id = ?', [id]);
        connection.release();

        return NextResponse.json({ success: true, message: 'Admin removed successfully' });

    } catch (error) {
        console.error(`Error deleting admin ${id}:`, error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove administrator' },
            { status: 500 }
        );
    }
}
