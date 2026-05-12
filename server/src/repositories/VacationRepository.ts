import {UnitOfWork} from "@/uow/UnifOrWork";
import {VacationInit} from "@/types/vacation";
import {ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {DbError} from "@/errors/DbError";
import pool from "@/config/dbConfig";

type VacationRequestRow = RowDataPacket & {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  used_days: number;
  reason: string;
  created_at: string;
};

export class VacationRepository {
  /**
   * 회원가입 시 기본 휴가 저장
   */
  async saveInit(uow: UnitOfWork, vacation: VacationInit): Promise<boolean> {
    try {
      const sql = `
          INSERT INTO vacation
              (user_id, vacation_year, vacation_available, created_at)
          VALUES (:user_id, :vacation_year, :vacation_available, :created_at)
          ON DUPLICATE KEY UPDATE vacation_available = VALUES(vacation_available),
                                  created_at         = VALUES(created_at)
      `;

      const params: { [key: string]: any } = {
        user_id: vacation.user_id,
        vacation_year: vacation.vacation_year,
        vacation_available: vacation.vacation_available,
        created_at: vacation.created_at,
      };

      const conn = uow.getConnection();
      const [rst] = await conn.execute<ResultSetHeader>(sql, params);

      return rst.affectedRows > 0;
    } catch (error) {
      throw DbError.from(error, '휴가 정보 저장 중 DB 오류가 발생했습니다', 'VACATION_SAVE_DB_ERROR');
    }
  }

  /**
   * 휴가 신청 저장
   */
  async createRequest(request: {
    user_id: number;
    start_date: string;
    end_date: string;
    used_days: number;
    reason: string;
    created_at: string;
  }): Promise<number> {
    try {
      const sql = `
          INSERT INTO vacation_requests
              (user_id, start_date, end_date, used_days, reason, created_at)
          VALUES (:user_id, :start_date, :end_date, :used_days, :reason, :created_at)
      `;

      const [rst] = await pool.execute<ResultSetHeader>(sql, request);
      return rst.affectedRows > 0 ? rst.insertId : 0;
    } catch (error) {
      throw DbError.from(error, '휴가 신청 저장 중 DB 오류가 발생했습니다', 'VACATION_REQUEST_SAVE_DB_ERROR');
    }
  }

  /**
   * 사용자의 휴가 신청 내역 조회
   */
  async findRequestsByUserId(userId: number): Promise<VacationRequestRow[]> {
    try {
      const sql = `
          SELECT id,
                 user_id,
                 start_date,
                 end_date,
                 used_days,
                 reason,
                 created_at
          FROM vacation_requests
          WHERE user_id = :userId
          ORDER BY created_at DESC
      `;

      const [rows] = await pool.execute<VacationRequestRow[]>(sql, {userId});
      return rows;
    } catch (error) {
      throw DbError.from(error, '휴가 신청 내역 조회 중 DB 오류가 발생했습니다', 'VACATION_REQUEST_FIND_DB_ERROR');
    }
  }

  /**
   * 휴가 신청 삭제
   */
  async deleteRequest(requestId: number): Promise<boolean> {
    try {
      const sql = `
          DELETE
          FROM vacation_requests
          WHERE id = :id
          LIMIT 1
      `;

      const [rst] = await pool.execute<ResultSetHeader>(sql, {id: requestId});
      return rst.affectedRows > 0;
    } catch (error) {
      throw DbError.from(error, '휴가 신청 삭제 중 DB 오류가 발생했습니다', 'VACATION_REQUEST_DELETE_DB_ERROR');
    }
  }

  /**
   * 사용자의 현재 연차 정보 조회
   */
  async findVacationByUserAndYear(userId: number, year: number): Promise<{
    id: number;
    vacation_available: number
  } | null> {
    try {
      const sql = `
          SELECT user_id as id,
                 vacation_available
          FROM vacation
          WHERE user_id = :userId
            AND vacation_year = :year
          LIMIT 1
      `;

      const [rows] = await pool.execute<any[]>(sql, {userId, year});
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw DbError.from(error, '연차 정보 조회 중 DB 오류가 발생했습니다', 'VACATION_FIND_DB_ERROR');
    }
  }

  /**
   * 사용자의 연차 총합 정보 조회
   */
  async findVacationSummaryByUserAndYear(userId: number, year: number): Promise<{ vacation_available: number } | null> {
    try {
      const sql = `
          SELECT vacation_available
          FROM vacation
          WHERE user_id = :userId
            AND vacation_year = :year
          LIMIT 1
      `;

      const [rows] = await pool.execute<any[]>(sql, {userId, year});
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw DbError.from(error, '연차 요약 조회 중 DB 오류가 발생했습니다', 'VACATION_SUMMARY_FIND_DB_ERROR');
    }
  }
}
