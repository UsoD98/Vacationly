import {User} from "@/types/user";
import {ResultSetHeader} from "mysql2/promise";
import {UnitOfWork} from "@/uow/UnifOrWork";

export class UserRepository {
  /**
   * 사용자 저장
   * @param uow
   * @param user
   */
  async save(uow: UnitOfWork, user: User): Promise<boolean> {
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

    return rst.affectedRows > 0;
  }

  async existsByEmail(uow: UnitOfWork, email: string): Promise<boolean> {
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
  }

  async existsById(uow: UnitOfWork, id: number): Promise<boolean> {
    const sql: string = `
        SELECT id
        FROM users
        WHERE id = :id
          AND del_flag = 0
        LIMIT 1
    `;

    const conn = uow.getConnection();
    const [rows] = await conn.execute(sql, {id});

    return (rows as any[]).length > 0;
  }

  async findById(uow: UnitOfWork, id: number): Promise<User | null> {
    const sql: string = `
        SELECT id, name, email, password, hire_date, created_at, del_flag
        FROM users
        WHERE id = :id
          AND del_flag = 0
        LIMIT 1
    `;

    const conn = uow.getConnection();
    const [rows] = await conn.execute(sql, {id});

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  async findByEmail(uow: UnitOfWork, email: string): Promise<User | null> {
    const sql: string = `
        SELECT id, name, email, password, hire_date, created_at, del_flag
        FROM users
        WHERE email = :email
          AND del_flag = 0
        LIMIT 1
    `;

    const conn = uow.getConnection();
    const [rows] = await conn.execute(sql, {email});

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }
}