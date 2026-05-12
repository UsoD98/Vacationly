import pool from "@/config/dbConfig";
import {PoolConnection} from "mysql2/promise";
import {AppError} from "@/errors/AppError";

export class UnitOfWork {
  private conn: PoolConnection | null = null;
  private isActive: boolean = false;

  /**
   * 트랜잭션 시작
   * @throws {AppError} 트랜잭션이 이미 시작된 경우
   * @throws {AppError} 트랜잭션 시작 실패 시
   */
  async begin() {
    if (this.isActive) {
      throw AppError.internal("트랜잭션이 이미 시작되었습니다");
    }

    try {
      this.conn = await pool.getConnection();
      await this.conn.beginTransaction();
      this.isActive = true;
    } catch (error) {
      this.conn?.release();
      this.conn = null;
      this.isActive = false;
      throw AppError.internal("트랜잭션 시작 실패", "TRANSACTION_START_FAILED");
    }
  }

  /**
   * 활성 트랜잭션의 connection 반환
   * @returns {PoolConnection}
   * @throws {AppError} 활성 트랜잭션이 없는 경우
   * @throws {AppError} 트랜잭션이 비활성화된 경우
   * @throws {AppError} 트랜잭션이 이미 종료된 경우
   */
  getConnection(): PoolConnection {
    if (!this.conn || !this.isActive) {
      throw AppError.internal("활성화된 트랜잭션이 없습니다", "NO_ACTIVE_TRANSACTION");
    }
    return this.conn;
  }

  /**
   * 트랜잭션 활성 상태 확인
   * @returns {boolean} 활성 트랜잭션이 존재하면 true, 그렇지 않으면 false
   */
  isTransactionActive(): boolean {
    return this.isActive && this.conn !== null;
  }

  /**
   * 트랜잭션 커밋
   * @throws {AppError} 활성 트랜잭션이 없는 경우
   * @throws {AppError} 트랜잭션 커밋 실패 시
   */
  async commit() {
    if (!this.isActive || !this.conn) {
      throw AppError.internal("커밋할 활성 트랜잭션이 없습니다", "NO_ACTIVE_TRANSACTION");
    }

    try {
      await this.conn.commit();
    } catch (error) {
      await this.conn.rollback();
      throw AppError.internal("트랜잭션 커밋 실패", "TRANSACTION_COMMIT_FAILED");
    } finally {
      this.conn.release();
      this.conn = null;
      this.isActive = false;
    }
  }

  /**
   * 트랜잭션 롤백
   * @throws {AppError} 트랜잭션 롤백 실패 시
   * @remarks 롤백 실패 시에도 connection을 정리하여 리소스 누수를 방지합니다.
   */
  async rollback() {
    if (!this.conn) {
      return; // 이미 정리된 경우
    }

    try {
      if (this.isActive) {
        await this.conn.rollback();
      }
    } catch (error) {
      // 롤백 실패 시에도 connection 정리
      console.error("롤백 중 오류 발생:", error);
    } finally {
      this.conn.release();
      this.conn = null;
      this.isActive = false;
    }
  }
}
