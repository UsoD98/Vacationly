import pool from '@/config/dbConfig';
import {User} from '@/types/user';
import {RowDataPacket, ResultSetHeader} from 'mysql2/promise';
import {UnitOfWork} from "@/uow/UnifOrWork";
import {DbError} from "@/errors/DbError";

type UserRow = RowDataPacket & User;

export class UserRepository {
  /**
   * 사용자 저장
   * @param uow
   * @param user
   */
  async save(uow: UnitOfWork, user: User): Promise<number> {
    try {
      const sql = `
          INSERT INTO users
              (name, email, password, hire_date, created_at, del_flag)
          VALUES (:name, :email, :password, :hire_date, :created_at, :del_flag)
      `;

      const params: { [key: string]: any } = {
        name: user.name,
        email: user.email,
        password: user.password,
        hire_date: user.hire_date,
        created_at: user.created_at,
        del_flag: user.del_flag ?? 0,
      };

      const conn = uow.getConnection();
      const [rst] = await conn.execute<ResultSetHeader>(sql, params);

      return rst.affectedRows > 0 ? rst.insertId : 0;
    } catch (error) {
      throw DbError.from(error, '사용자 저장 중 DB 오류가 발생했습니다', 'USER_SAVE_DB_ERROR');
    }
  }

  async existsByEmail(uow: UnitOfWork, email: string): Promise<boolean> {
    try {
      const sql: string = `
          SELECT id
          FROM users
          WHERE email = :email
            AND del_flag = 0
          LIMIT 1
      `;

      const conn = uow.getConnection();
      const [rows] = await conn.execute(sql, {email});

      return (rows as any[]).length > 0;
    } catch (error) {
      throw DbError.from(error, '이메일 중복 확인 중 DB 오류가 발생했습니다', 'USER_EXISTS_BY_EMAIL_DB_ERROR');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const sql = `
          SELECT
              u.id,
              u.name,
              u.email,
              u.hire_date,
              u.created_at,
              u.del_flag,
              COALESCE(v.vacation_available, 0) AS vacation_available
          FROM users u
          LEFT JOIN vacation v
            ON v.user_id = u.id
           AND v.vacation_year = CAST(YEAR(CURDATE()) AS CHAR)
          WHERE u.del_flag = 0
          ORDER BY u.id DESC
      `;

      const [rows] = await pool.execute<UserRow[]>(sql);
      return rows as User[];
    } catch (error) {
      throw DbError.from(error, '사용자 목록 조회 중 DB 오류가 발생했습니다', 'USER_FIND_ALL_DB_ERROR');
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const sql = `
          SELECT
              u.id,
              u.name,
              u.email,
              u.hire_date,
              u.created_at,
              u.del_flag,
              COALESCE(v.vacation_available, 0) AS vacation_available
          FROM users u
          LEFT JOIN vacation v
            ON v.user_id = u.id
           AND v.vacation_year = CAST(YEAR(CURDATE()) AS CHAR)
          WHERE u.id = :id
            AND u.del_flag = 0
          LIMIT 1
      `;

      const [rows] = await pool.execute<UserRow[]>(sql, {id});
      return rows.length > 0 ? (rows[0] as User) : null;
    } catch (error) {
      throw DbError.from(error, '사용자 조회 중 DB 오류가 발생했습니다', 'USER_FIND_BY_ID_DB_ERROR');
    }
  }

  async findByEmail(email: string, excludeId?: number): Promise<User | null> {
    try {
      const sql = `
          SELECT
              id,
              name,
              email,
              hire_date,
              created_at,
              del_flag
          FROM users
          WHERE email = :email
            AND del_flag = 0
            ${excludeId ? 'AND id <> :excludeId' : ''}
          LIMIT 1
      `;

      const params: Record<string, number | string> = {email};
      if (excludeId) {
        params.excludeId = excludeId;
      }

      const [rows] = await pool.execute<UserRow[]>(sql, params);
      return rows.length > 0 ? (rows[0] as User) : null;
    } catch (error) {
      throw DbError.from(error, '이메일 조회 중 DB 오류가 발생했습니다', 'USER_FIND_BY_EMAIL_DB_ERROR');
    }
  }

  async update(id: number, user: Partial<User>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const params: Record<string, string | number> = {id};

      if (user.name !== undefined) {
        fields.push('name = :name');
        params.name = user.name;
      }

      if (user.email !== undefined) {
        fields.push('email = :email');
        params.email = user.email;
      }

      if (user.password !== undefined) {
        fields.push('password = :password');
        params.password = user.password;
      }

      if (user.hire_date !== undefined) {
        fields.push('hire_date = :hire_date');
        params.hire_date = user.hire_date;
      }

      if (user.del_flag !== undefined) {
        fields.push('del_flag = :del_flag');
        params.del_flag = user.del_flag;
      }

      if (fields.length === 0) {
        return false;
      }

      const sql = `
          UPDATE users
          SET ${fields.join(', ')}
          WHERE id = :id
            AND del_flag = 0
      `;

      const [rst] = await pool.execute<ResultSetHeader>(sql, params);
      return rst.affectedRows > 0;
    } catch (error) {
      throw DbError.from(error, '사용자 수정 중 DB 오류가 발생했습니다', 'USER_UPDATE_DB_ERROR');
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      const sql = `
          UPDATE users
          SET del_flag = 1
          WHERE id = :id
            AND del_flag = 0
      `;

      const [rst] = await pool.execute<ResultSetHeader>(sql, {id});
      return rst.affectedRows > 0;
    } catch (error) {
      throw DbError.from(error, '사용자 삭제 중 DB 오류가 발생했습니다', 'USER_DELETE_DB_ERROR');
    }
  }
}