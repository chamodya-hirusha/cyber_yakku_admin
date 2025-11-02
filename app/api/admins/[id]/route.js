import { NextResponse } from 'next/server';
import pool from '@/lib/database';

// Map frontend display names to database ENUM values
const ROLE_MAPPING = {
  'Super Admin': 'SUPER_ADMIN',
  'Content Manager': 'CONTENT_MANAGER',
  'Product Manager': 'PRODUCT_MANAGER',
  'Marketing Manager': 'MARKETING_MANAGER',
};

// Reverse mapping for reading from database
const ROLE_DISPLAY_MAPPING = {
  'SUPER_ADMIN': 'Super Admin',
  'CONTENT_MANAGER': 'Content Manager',
  'PRODUCT_MANAGER': 'Product Manager',
  'MARKETING_MANAGER': 'Marketing Manager',
};

// Map frontend permission values to database ENUM values
const PERMISSION_MAPPING = {
  'content': 'CONTENT_MANAGEMENT',
  'media': 'MEDIA_LIBRARY',
  'products': 'PRODUCT_MANAGEMENT',
  'orders': 'ORDER_MANAGEMENT',
  'users': 'USER_MANAGEMENT',
  'analytics': 'ANALYTICS',
  'settings': 'SYSTEM_SETTINGS',
  'all': 'FULL_ACCESS',
};

// PUT /api/admins/[id] - Update an admin
export async function PUT(request, { params }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { name, email, password, status, permissions, role, lastLogin } = body;

        if (!name || !email) {
            return NextResponse.json(
                { success: false, error: 'Please fill in all required fields' },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();

        // Build dynamic UPDATE for `admin` table
        const fields = ['fullname = ?', 'email = ?'];
        const paramsArr = [name, email];
        if (typeof status === 'boolean' || typeof status === 'number') {
            // prefer status, but your schema may use stusta
            fields.push('status = ?');
            paramsArr.push(Number(Boolean(status)));
        }
        if (typeof role === 'string' && role.trim()) {
            fields.push('role = ?');
            // Map frontend role to database ENUM value
            const roleValue = ROLE_MAPPING[role.trim()] || role.trim().toUpperCase().replace(/\s+/g, '_');
            paramsArr.push(roleValue);
        }
        if (lastLogin === null) {
            // allow clearing lastLogin
            fields.push('lastLogin = NULL');
        } else if (lastLogin) {
            fields.push('lastLogin = ?');
            paramsArr.push(new Date(lastLogin));
        }
        if (Array.isArray(permissions) && permissions.length > 0) {
            // Since permissions is an ENUM, we can only store ONE value
            // Use the first selected permission
            const firstPerm = permissions[0];
            const permValue = PERMISSION_MAPPING[firstPerm] || firstPerm.toUpperCase();
            fields.push('permissions = ?');
            paramsArr.push(permValue);
        }
        if (password) {
            fields.push('password = ?');
            paramsArr.push(password);
        }
        paramsArr.push(id);

        try {
            await connection.execute(`
                UPDATE admin
                SET ${fields.join(', ')}
                WHERE id = ?
            `, paramsArr);
        } catch (err) {
            // If optional columns don't exist or are truncated, retry without them
            const isBadField = err && err.code === 'ER_BAD_FIELD_ERROR';
            const isPermsTruncated = err && (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'WARN_DATA_TRUNCATED' || /Data truncated.*permissions/i.test(err.message || ''));
            if (isBadField || isPermsTruncated) {
                // Map to your schema: stusta for status, lastlogin for lastLogin
                const tryAlt = [];
                const tryAltParams = [];
                fields.forEach((f, idx) => {
                    if (f.trim() === 'status = ?') {
                        tryAlt.push('stusta = ?');
                        tryAltParams.push(paramsArr[idx]);
                    } else if (f.trim() === 'lastLogin = ?') {
                        tryAlt.push('lastlogin = ?');
                        tryAltParams.push(paramsArr[idx]);
                    } else if (f.trim() === 'lastLogin = NULL') {
                        tryAlt.push('lastlogin = NULL');
                    } else {
                        tryAlt.push(f);
                        tryAltParams.push(paramsArr[idx]);
                    }
                });
                tryAltParams.push(id);
                try {
                    await connection.execute(`
                        UPDATE admin
                        SET ${tryAlt.join(', ')}
                        WHERE id = ?
                    `, tryAltParams);
                } catch (e2) {
                    const filteredFields = fields.filter(f => !['status = ?', 'permissions = ?', 'role = ?', 'lastLogin = ?'].includes(f.trim()));
                    const filteredParams = [];
                    filteredFields.forEach(f => {
                        if (f.startsWith('fullname')) filteredParams.push(name);
                        else if (f.startsWith('email')) filteredParams.push(email);
                        else if (f.startsWith('password')) filteredParams.push(password);
                    });
                    filteredParams.push(id);
                    await connection.execute(`
                        UPDATE admin
                        SET ${filteredFields.join(', ')}
                        WHERE id = ?
                    `, filteredParams);
                }
            } else {
                throw err;
            }
        }

        connection.release();

        // Get the display role for response
        const displayRole = typeof role === 'string' ? role : 'Super Admin';
        
        return NextResponse.json({
            success: true,
            data: { id, name, email, role: displayRole, permissions: Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []) }
        });

    } catch (error) {
        console.error(`Error updating admin ${id}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { success: false, error: 'An admin with this email already exists.' },
                { status: 409 }
            );
        }
        // Check for ENUM data truncation errors
        if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || error.code === 'WARN_DATA_TRUNCATED' || error.message?.includes('Data truncated')) {
            return NextResponse.json(
                { success: false, error: `Invalid role or permission value. Please check the selected values match the database schema.` },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: `Failed to update administrator${error.sqlMessage ? `: ${error.sqlMessage}` : ''}` },
            { status: 500 }
        );
    }
}

// DELETE /api/admins/[id] - Delete an admin
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM admin WHERE id = ?', [id]);
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
