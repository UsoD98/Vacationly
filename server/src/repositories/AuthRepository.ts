import pool from '@/config/dbConfig';

export class AuthRepository {
  public async findByEmail(email: string) {
	const connection = await pool.getConnection();
	try {
	  const [rows] = await connection.query(
		'SELECT id, name, email, password FROM users WHERE email = ? AND del_flag = 0 LIMIT 1',
		[email],
	  );

	  return (rows as any[])[0] || null;
	} finally {
	  connection.release();
	}
  }

  public async findByIdAndEmail(id: number, email: string) {
	const connection = await pool.getConnection();
	try {
	  const [rows] = await connection.query(
		'SELECT id, name, email FROM users WHERE id = ? AND email = ? AND del_flag = 0 LIMIT 1',
		[id, email],
	  );

	  return (rows as any[])[0] || null;
	} finally {
	  connection.release();
	}
  }
}