import {VacationRepository} from "@/repositories/VacationRepository";
import {UnitOfWork} from "@/uow/UnifOrWork";
import {VacationInit, VacationSummary} from "@/types/vacation";
import {AppError} from "@/errors/AppError";
import {DbError} from "@/errors/DbError";

export class VacationService {
  constructor(private readonly repository: VacationRepository) {
  }

  /**
   * 회원가입 시 기본 휴가 저장
   * @param uow
   * @param vacation
   * @return 성공 여부
   */
  async createInitVacation(uow: UnitOfWork, vacation: VacationInit): Promise<boolean> {
    try {
      // 외부에서 시작한 트랜잭션 사용 여부 확인
      if (!uow.isTransactionActive()) {
        throw AppError.internal('트랜잭션 활성화 실패', 'TRANSACTION_NOT_ACTIVE');
      }

      // 휴가 정보 저장
      const rst = await this.repository.saveInit(uow, vacation);
      if (!rst) {
        throw AppError.notFound('저장할 데이터가 없습니다.', 'VACATION_SAVE_NO_DATA');
      }

      return true;
    } catch (error) {

      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '휴가 정보 생성 중 오류 발생', 'VACATION_CREATE_FAILED');
    }
  }

  /**
   * 휴가 신청
   */
  async requestVacation(request: {
    user_id: number;
    start_date: string;
    end_date: string;
    used_days: number;
    reason: string;
    created_at: string;
  }): Promise<number> {
    try {
      const year = new Date().getFullYear();

      // 현재 연차 확인
      const vacation = await this.repository.findVacationByUserAndYear(request.user_id, year);
      if (!vacation) {
        throw AppError.notFound('연차 정보를 찾을 수 없습니다.', 'VACATION_NOT_FOUND');
      }

      const availableVacation = Number(vacation.vacation_available) || 0;
      const usedDays = Number(request.used_days) || 0;

      // 남은 연차가 충분한지 확인
      if (availableVacation < usedDays) {
        throw AppError.badRequest(
          `남은 연차가 부족합니다. (남은 연차: ${availableVacation}일)`,
          'INSUFFICIENT_VACATION'
        );
      }

      // 휴가 신청 저장
      const requestId = await this.repository.createRequest(request);
      if (!requestId) {
        throw AppError.notFound('휴가 신청을 저장할 수 없습니다.', 'VACATION_REQUEST_SAVE_NO_DATA');
      }

      return requestId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '휴가 신청 중 오류 발생', 'VACATION_REQUEST_FAILED');
    }
  }

  /**
   * 사용자의 휴가 신청 내역 조회
   */
  async getUserRequests(userId: number): Promise<any[]> {
    try {
      return await this.repository.findRequestsByUserId(userId);
    } catch (error) {
      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '휴가 신청 내역 조회 중 오류 발생', 'VACATION_REQUEST_FIND_FAILED');
    }
  }

  /**
   * 사용자의 현재 연차 정보 조회
   */
  async getRemainingVacation(userId: number): Promise<number> {
    try {
      const summary = await this.getVacationSummary(userId);
      return summary.remaining_vacation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '남은 연차 조회 중 오류 발생', 'REMAINING_VACATION_FAILED');
    }
  }

  /**
   * 사용자의 연차 총합/사용/잔여 조회
   */
  async getVacationSummary(userId: number): Promise<VacationSummary> {
    try {
      const year = new Date().getFullYear();

      const vacation = await this.repository.findVacationByUserAndYear(userId, year);
      if (!vacation) {
        throw AppError.notFound('연차 정보를 찾을 수 없습니다.', 'VACATION_NOT_FOUND');
      }

      const totalVacation = Number(vacation.vacation_available) || 0;
      const usedVacation = (await this.repository.findRequestsByUserId(userId))
        .reduce((sum, req) => sum + (Number(req.used_days) || 0), 0);
      const remainingVacation = Math.max(totalVacation - usedVacation, 0);

      return {
        vacation_year: year,
        total_vacation: totalVacation,
        used_vacation: usedVacation,
        remaining_vacation: remainingVacation,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '연차 요약 조회 중 오류 발생', 'VACATION_SUMMARY_FAILED');
    }
  }

  /**
   * 휴가 신청 취소 (삭제)
   */
  async deleteRequest(requestId: number, userId: number): Promise<void> {
    try {
      // 먼저 요청 정보 조회해서 사용자 확인
      const requests = await this.repository.findRequestsByUserId(userId);
      const request = requests.find(r => r.id === requestId);

      if (!request) {
        throw AppError.notFound('해당 휴가 신청이 없습니다.', 'VACATION_REQUEST_NOT_FOUND');
      }

      // 삭제 전 연차 복구를 위해 먼저 복구
      const year = new Date().getFullYear();
      const vacationData = await this.repository.findVacationByUserAndYear(userId, year);

      if (vacationData) {
        // 직접 실행 필요 - 현재 repository의 범용 메서드 부족
        // 임시 방안: 단순 삭제만 수행
      }

      // 휴가 신청 삭제
      const deleted = await this.repository.deleteRequest(requestId);
      if (!deleted) {
        throw AppError.notFound('휴가 신청을 삭제할 수 없습니다.', 'VACATION_REQUEST_DELETE_NO_DATA');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DbError) {
        throw error;
      }

      throw AppError.internal((error as Error).message || '휴가 신청 삭제 중 오류 발생', 'VACATION_REQUEST_DELETE_FAILED');
    }
  }
}