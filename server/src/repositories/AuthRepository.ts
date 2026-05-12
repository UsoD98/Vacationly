import pool from '@/config/dbConfig';
import {DbError} from '@/errors/DbError';

export class AuthRepository {
  public async findByEmail(email: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT id, name, email, password FROM users WHERE email = ? AND del_flag = 0 LIMIT 1',
        [email],
      );

      return (rows as any[])[0] || null;
    } catch (error) {
      throw DbError.from(error, '이메일 조회 중 DB 오류가 발생했습니다', 'AUTH_FIND_BY_EMAIL_DB_ERROR');
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
    } catch (error) {
      throw DbError.from(error, '사용자 조회 중 DB 오류가 발생했습니다', 'AUTH_FIND_BY_ID_AND_EMAIL_DB_ERROR');
    } finally {
      connection.release();
    }
  }
}