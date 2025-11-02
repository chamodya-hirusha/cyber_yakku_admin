"use server";
import { NextResponse } from 'next/server';
import pool from '@/lib/database';

// Map database role values to display format
const ROLE_DISPLAY_MAPPING = {
  'SUPER_ADMIN': 'Super Admin',
  'CONTENT_MANAGER': 'Content Manager',
  'PRODUCT_MANAGER': 'Product Manager',
  'MARKETING_MANAGER': 'Marketing Manager',
};

export async function GET() {
  try {
    const connection = await pool.getConnection();
    let rows;
    
    // First, try to detect what columns exist in the admin table
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
      console.log('Available admin table columns:', Object.keys(availableColumns));
    } catch (schemaErr) {
      console.warn('Could not query schema:', schemaErr.message);
    }
    
    // Build query dynamically based on available columns
    let dateColumns = {
      joinDate: null,
      lastLogin: null
    };
    
    // Find join date column (check various naming conventions)
    if (availableColumns['joindate']) dateColumns.joinDate = availableColumns['joindate'];
    else if (availableColumns['created_at']) dateColumns.joinDate = availableColumns['created_at'];
    
    // Find last login column (check various naming conventions)
    if (availableColumns['lastlogin']) dateColumns.lastLogin = availableColumns['lastlogin'];
    else if (availableColumns['last_login']) dateColumns.lastLogin = availableColumns['last_login'];
    
    // Try different query strategies to handle various column name patterns
    const queries = [];
    
    // If we detected columns from schema, build a custom query first
    if (Object.keys(availableColumns).length > 0 && (dateColumns.joinDate || dateColumns.lastLogin)) {
      let selectFields = ['id', 'fullname AS name', 'email'];
      if (availableColumns['role']) selectFields.push('role');
      if (availableColumns['status'] || availableColumns['stusta']) {
        selectFields.push('COALESCE(status, stusta) AS status');
      }
      if (dateColumns.joinDate) {
        selectFields.push(`${dateColumns.joinDate} AS joinDate`);
      }
      if (dateColumns.lastLogin) {
        selectFields.push(`${dateColumns.lastLogin} AS lastLogin`);
      }
      if (availableColumns['permissions']) {
        selectFields.push('permissions');
      }
      
      queries.push(`SELECT ${selectFields.join(', ')} FROM admin ORDER BY id DESC`);
      console.log('Using dynamically built query with date columns:', dateColumns);
    }
    
    // Add fallback queries
    queries.push(
      // Strategy 1: Try with camelCase (joinDate, lastLogin)
      `SELECT id, fullname AS name, email, role,
              COALESCE(status, stusta) AS status,
              joinDate, lastLogin, permissions
       FROM admin ORDER BY id DESC`,
      
      // Strategy 2: Try with lowercase (joindate, lastlogin)
      `SELECT id, fullname AS name, email, role,
              COALESCE(status, stusta) AS status,
              joindate AS joinDate, lastlogin AS lastLogin, permissions
       FROM admin ORDER BY id DESC`,
      
      // Strategy 3: Try with snake_case (last_login)
      `SELECT id, fullname AS name, email, role,
              COALESCE(status, stusta) AS status,
              joindate AS joinDate, last_login AS lastLogin, permissions
       FROM admin ORDER BY id DESC`,
      
      // Strategy 4: Try with created_at as joinDate
      `SELECT id, fullname AS name, email, role,
              COALESCE(status, stusta) AS status,
              created_at AS joinDate, lastlogin AS lastLogin, permissions
       FROM admin ORDER BY id DESC`,
      
      // Strategy 5: Basic fields only (fallback)
      `SELECT id, fullname AS name, email, role,
              COALESCE(status, stusta) AS status, permissions
       FROM admin ORDER BY id DESC`
    );
    
    let querySucceeded = false;
    for (const query of queries) {
      try {
        [rows] = await connection.execute(query);
        querySucceeded = true;
        break;
      } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          continue; // Try next query
        } else {
          throw err; // Unexpected error
        }
      }
    }
    
    if (!querySucceeded) {
      // Last resort: minimal fields only
      [rows] = await connection.execute(`
        SELECT id, fullname AS name, email
        FROM admin
        ORDER BY id DESC
      `);
    }
    
    connection.release();
    
    // Log raw data for debugging
    if (rows.length > 0) {
      console.log('Sample raw admin data:', JSON.stringify(rows[0], null, 2));
    }

    const formattedAdmins = rows.map(admin => {
      // Map role from database format to display format
      const roleValue = admin.role || 'SUPER_ADMIN';
      const displayRole = ROLE_DISPLAY_MAPPING[roleValue] || roleValue;

      // Format joinDate - check all possible column names
      let joinDateFormatted = '';
      const joinDateRaw = admin.joinDate || admin.joindate || admin.join_date || admin.created_at;
      if (joinDateRaw !== null && joinDateRaw !== undefined && joinDateRaw !== '') {
        try {
          const joinDate = new Date(joinDateRaw);
          if (!isNaN(joinDate.getTime())) {
            joinDateFormatted = joinDate.toISOString().split('T')[0];
          } else {
            console.warn('Invalid joinDate value:', joinDateRaw, 'for admin:', admin.id);
          }
        } catch (e) {
          console.error('Error formatting joinDate:', e, 'Raw value:', joinDateRaw, 'for admin:', admin.id);
        }
      } else {
        // If no join date found, log for debugging
        if (rows.length === 1 || admin.id === rows[0]?.id) {
          console.log('No joinDate found in admin record. Available keys:', Object.keys(admin));
        }
      }

      // Format lastLogin - check all possible column names
      let lastLoginFormatted = '';
      const lastLoginRaw = admin.lastLogin || admin.lastlogin || admin.last_login;
      if (lastLoginRaw !== null && lastLoginRaw !== undefined && lastLoginRaw !== '') {
        try {
          const lastLogin = new Date(lastLoginRaw);
          if (!isNaN(lastLogin.getTime())) {
            lastLoginFormatted = lastLogin.toISOString().split('T')[0];
          } else {
            console.warn('Invalid lastLogin value:', lastLoginRaw, 'for admin:', admin.id);
          }
        } catch (e) {
          console.error('Error formatting lastLogin:', e, 'Raw value:', lastLoginRaw, 'for admin:', admin.id);
        }
      }

      // Parse permissions
      let permissionsArray = [];
      if (admin.permissions) {
        if (typeof admin.permissions === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(admin.permissions);
            permissionsArray = Array.isArray(parsed) ? parsed : [];
          } catch {
            // If not JSON, treat as comma-separated string
            permissionsArray = String(admin.permissions)
              .split(',')
              .map(p => p.trim())
              .filter(Boolean);
          }
        } else if (Array.isArray(admin.permissions)) {
          permissionsArray = admin.permissions;
        }
      }

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: displayRole,
        status: typeof admin.status === 'number' || typeof admin.status === 'boolean'
          ? Boolean(admin.status)
          : (admin.status === undefined ? true : Boolean(admin.status)),
        joinDate: joinDateFormatted,
        lastLogin: lastLoginFormatted,
        permissions: permissionsArray,
      };
    });

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
    const { name, email, password, status, permissions, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    let result;
    
    // Prepare values - all required fields must have values
    const hasStatus = (typeof status === 'boolean' || typeof status === 'number');
    const statusVal = hasStatus ? Number(Boolean(status)) : 1; // Default to 1 (active)
    
    // Store permissions as a short comma-separated string to fit VARCHAR columns
    const permsString = Array.isArray(permissions) ? permissions.join(',') : (typeof permissions === 'string' ? permissions : null);
    const permsValue = typeof permsString === 'string' ? permsString.slice(0, 250) : null;
    const roleValue = typeof role === 'string' && role.trim() ? role.trim().slice(0, 100) : 'Admin';

    // Try multiple insert strategies, always including required fields: status, joindate, lastlogin
    try {
      // Strategy 1: Try with canonical column names (status, joinDate, lastLogin) - set lastlogin to CURRENT_TIMESTAMP
      [result] = await connection.execute(
        'INSERT INTO admin (email, password, fullname, role, status, permissions, joinDate, lastLogin) VALUES (?, ?, ?, ?, ?, ?, NOW(), CURRENT_TIMESTAMP)',
        [email, password, name, roleValue, statusVal, permsValue]
      );
    } catch (e1) {
      try {
        // Strategy 2: Try with snake_case column names (stusta, joindate, lastlogin) - set lastlogin to CURRENT_TIMESTAMP
        [result] = await connection.execute(
          'INSERT INTO admin (email, password, fullname, role, stusta, permissions, joindate, lastlogin) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [email, password, name, roleValue, statusVal, permsValue]
        );
      } catch (e2) {
        try {
          // Strategy 3: Try with status, joindate, lastlogin (mixed case) - set lastlogin to CURRENT_TIMESTAMP
          [result] = await connection.execute(
            'INSERT INTO admin (email, password, fullname, role, status, permissions, joindate, lastlogin) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [email, password, name, roleValue, statusVal, permsValue]
          );
        } catch (e3) {
          try {
            // Strategy 4: Try with status, joindate, last_login (with underscore) - set last_login to CURRENT_TIMESTAMP
            [result] = await connection.execute(
              'INSERT INTO admin (email, password, fullname, role, status, permissions, joindate, last_login) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
              [email, password, name, roleValue, statusVal, permsValue]
            );
          } catch (e4) {
            try {
              // Strategy 5: Try without permissions (if it's optional)
              [result] = await connection.execute(
                'INSERT INTO admin (email, password, fullname, role, stusta, joindate, lastlogin) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                [email, password, name, roleValue, statusVal]
              );
            } catch (e5) {
              try {
                // Strategy 6: Try without role (if it has a default)
                [result] = await connection.execute(
                  'INSERT INTO admin (email, password, fullname, stusta, joindate, lastlogin) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                  [email, password, name, statusVal]
                );
              } catch (e6) {
                // Strategy 7: Minimal required fields only
                [result] = await connection.execute(
                  'INSERT INTO admin (email, password, fullname, stusta, joindate, lastlogin) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                  [email, password, name]
                );
              }
            }
          }
        }
      }
    }
    connection.release();

    const newAdminId = result.insertId;

    return NextResponse.json({
        success: true,
        data: {
            id: newAdminId,
            name,
            email,
            role: roleValue || 'Admin',
            permissions: Array.isArray(permissions) ? permissions : (permissions ? [permissions] : [])
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
      { success: false, error: `Failed to add administrator${error.sqlMessage ? `: ${error.sqlMessage}` : ''}` },
      { status: 500 }
    );
  }
}
