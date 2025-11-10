import bcrypt from 'bcrypt';

import { Database } from './mssql';

export async function seedAdmin() {
  const db = Database.getInstance();
  const pool = await db.connect();

  const result = await pool
    .request()
    .query('SELECT COUNT(*) as count FROM user_data WHERE userRole = \'admin\'');

  if (result.recordset[0].count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.request()
      .input('firstName', 'Admin')
      .input('lastName', 'User')
      .input('userName', 'admin')
      .input('email', 'admin@admin.com')
      .input('passwordHash', hashedPassword)
      .input('userRole', 'admin')
      .query(`
        INSERT INTO user_data (firstName, lastName, userName, email, passwordHash, userRole)
        VALUES (@firstName, @lastName, @userName, @email, @passwordHash, @userRole)
      `);

    console.log('✅ Administrator user created: admin@admin.com / admin123');
  } else {
    console.log('There is already at least one admin user.');
  }
}