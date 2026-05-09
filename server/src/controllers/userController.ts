import { Request, Response } from 'express';
import pool from '@/config/dbConfig';
import { User, CreateUserRequest, UpdateUserRequest } from '@/types/user';

// 날짜 포맷팅 함수
function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

// 날짜만 포맷팅 (yyyyMMdd)
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 모든 사용자 조회
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE del_flag = 0 ORDER BY id DESC');
    connection.release();
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// 사용자 상세 조회
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ? AND del_flag = 0', [id]);
    connection.release();

    if ((rows as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
      return;
    }

    res.json({
      success: true,
      data: (rows as any[])[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// 사용자 생성
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, hire_date } = req.body as CreateUserRequest;

    if (!name || !email || !password || !hire_date) {
      res.status(400).json({
        success: false,
        message: '필수 필드를 입력해주세요 (name, email, password, hire_date)',
      });
      return;
    }

    const connection = await pool.getConnection();

    // 이메일 중복 확인
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? AND del_flag = 0',
      [email],
    );

    if ((existing as any[]).length > 0) {
      connection.release();
      res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다',
      });
      return;
    }

    const created_at = getCurrentDateTime();
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, hire_date, created_at, del_flag) VALUES (?, ?, ?, ?, ?, 0)',
      [name, email, password, hire_date, created_at],
    );

    connection.release();

    res.json({
      success: true,
      message: '사용자가 추가되었습니다',
      data: {
        id: (result as any).insertId,
        name,
        email,
        hire_date,
        created_at,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// 사용자 정보 수정
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, hire_date } = req.body as UpdateUserRequest;

    if (!name && !email && !password && !hire_date) {
      res.status(400).json({
        success: false,
        message: '변경할 필드를 입력해주세요',
      });
      return;
    }

    const connection = await pool.getConnection();

    // 존재하는 사용자 확인
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND del_flag = 0',
      [id],
    );

    if ((existing as any[]).length === 0) {
      connection.release();
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
      return;
    }

    // 이메일 중복 확인 (다른 사용자의 이메일인 경우)
    if (email) {
      const [conflicting] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ? AND del_flag = 0',
        [email, id],
      );

      if ((conflicting as any[]).length > 0) {
        connection.release();
        res.status(400).json({
          success: false,
          message: '이미 존재하는 이메일입니다',
        });
        return;
      }
    }

    let updateQuery = 'UPDATE users SET ';
    const updateValues: any[] = [];
    const updateFields: string[] = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (password) {
      updateFields.push('password = ?');
      updateValues.push(password);
    }
    if (hire_date) {
      updateFields.push('hire_date = ?');
      updateValues.push(hire_date);
    }

    updateQuery += updateFields.join(', ') + ' WHERE id = ?';
    updateValues.push(id);

    await connection.query(updateQuery, updateValues);
    connection.release();

    res.json({
      success: true,
      message: '사용자 정보가 수정되었습니다',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// 사용자 삭제 (소프트 삭제)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    // 존재하는 사용자 확인
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND del_flag = 0',
      [id],
    );

    if ((existing as any[]).length === 0) {
      connection.release();
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
      return;
    }

    await connection.query('UPDATE users SET del_flag = 1 WHERE id = ?', [id]);
    connection.release();

    res.json({
      success: true,
      message: '사용자가 삭제되었습니다',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

