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

    // Detect columns dynamically
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
      console.warn('Could not query schema:', schemaErr.message);
    }

    // Identify date columns
    const dateColumns = {
      joinDate: availableColumns['joindate'] || availableColumns['created_at'] || null,
      lastLogin: availableColumns['lastlogin'] || availableColumns['last_login'] || null
    };

    // Build select fields dynamically
    const selectFields = ['id', 'fullname AS name', 'email'];
    if (availableColumns['role']) selectFields.push('role');
    if (availableColumns['status']) selectFields.push('status');
    if (availableColumns['permissions']) selectFields.push('permissions');
    if (dateColumns.joinDate) selectFields.push(`${dateColumns.joinDate} AS joinDate`);
    if (dateColumns.lastLogin) selectFields.push(`${dateColumns.lastLogin} AS lastLogin`);

    // Execute query
    [rows] = await connection.execute(`SELECT ${selectFields.join(', ')} FROM admin ORDER BY id DESC`);
    connection.release();

    // Format results
    const formattedAdmins = rows.map(admin => {
      const roleValue = admin.role || 'SUPER_ADMIN';
      const displayRole = ROLE_DISPLAY_MAPPING[roleValue] || roleValue;

      // Format joinDate
      let joinDateFormatted = 'N/A';
      if (admin.joinDate) {
        const d = new Date(admin.joinDate);
        if (!isNaN(d.getTime())) joinDateFormatted = d.toISOString().split('T')[0];
      }

      // Format lastLogin
      let lastLoginFormatted = 'Never';
      if (admin.lastLogin) {
        const d = new Date(admin.lastLogin);
        if (!isNaN(d.getTime())) lastLoginFormatted = d.toISOString().split('T')[0];
      }

      // Format permissions
      let permissionsArray = [];
      const permsRaw = admin.permissions;
      if (permsRaw) {
        if (typeof permsRaw === 'string') {
          try {
            permissionsArray = JSON.parse(permsRaw);
            if (!Array.isArray(permissionsArray)) permissionsArray = [permissionsArray];
          } catch {
            permissionsArray = permsRaw.split(',').map(p => p.trim()).filter(Boolean);
          }
        } else if (Array.isArray(permsRaw)) {
          permissionsArray = permsRaw;
        } else {
          permissionsArray = [String(permsRaw)];
        }
      }

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: displayRole,
        status: admin.status === undefined ? true : Boolean(admin.status),
        joinDate: joinDateFormatted,
        lastLogin: lastLoginFormatted,
        permissions: permissionsArray
      };
    });

    return NextResponse.json({ success: true, data: formattedAdmins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch administrators' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, status, permissions, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    let result;

    // Prepare values
    const statusVal = (typeof status === 'boolean' || typeof status === 'number') ? Number(Boolean(status)) : 1;
    const roleValue = role ? role.trim().slice(0, 100) : 'Admin';
    const permsString = Array.isArray(permissions) ? permissions.join(',') : (typeof permissions === 'string' ? permissions : null);
    const permsValue = permsString ? permsString.slice(0, 250) : null;

    // Detect columns
    let availableColumns = {};
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admin'
    `);
    columns.forEach(col => {
      availableColumns[col.COLUMN_NAME.toLowerCase()] = col.COLUMN_NAME;
    });

    // Build INSERT dynamically
    const insertFields = ['email', 'password', 'fullname'];
    const insertValues = [email, password, name];

    if (availableColumns['role']) { insertFields.push('role'); insertValues.push(roleValue); }
    if (availableColumns['status']) { insertFields.push('status'); insertValues.push(statusVal); }
    else if (availableColumns['stusta']) { insertFields.push('stusta'); insertValues.push(statusVal); }
    if (availableColumns['permissions'] && permsValue) { insertFields.push('permissions'); insertValues.push(permsValue); }

    const joinDateColumn = availableColumns['joindate'] || availableColumns['created_at'];
    if (joinDateColumn) { insertFields.push(joinDateColumn); insertValues.push('CURRENT_TIMESTAMP'); }

    const lastLoginColumn = availableColumns['lastlogin'] || availableColumns['last_login'];
    if (lastLoginColumn) { insertFields.push(lastLoginColumn); insertValues.push(null); }

    // Prepare placeholders
    const fieldsForParams = [];
    const valuesForParams = [];
    const timestampFields = [];

    insertFields.forEach((field, idx) => {
      if (insertValues[idx] === 'CURRENT_TIMESTAMP') timestampFields.push(field);
      else fieldsForParams.push(field) && valuesForParams.push(insertValues[idx]);
    });

    const allFields = [...fieldsForParams, ...timestampFields];
    const placeholders = [...fieldsForParams.map(() => '?'), ...timestampFields.map(() => 'CURRENT_TIMESTAMP')];

    const insertQuery = `INSERT INTO admin (${allFields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    [result] = await connection.execute(insertQuery, valuesForParams);
    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
        name,
        email,
        role: roleValue,
        permissions: Array.isArray(permissions) ? permissions : (permissions ? [permissions] : [])
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding admin:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'An admin with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: `Failed to add administrator${error.sqlMessage ? `: ${error.sqlMessage}` : ''}` }, { status: 500 });
  }
}
