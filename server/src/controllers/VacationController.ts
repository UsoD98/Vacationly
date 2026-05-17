import {Request, Response} from 'express';
import {VacationService} from "@/services/VacationService";
import {AppError} from "@/errors/AppError";
import {getCurrentDateTime, setDateTime} from "@/utils/date";
import {UnitOfWork} from "@/uow/UnifOrWork";
import type {VacationSummary} from "@/types/vacation";

interface VacationRequestBody {
  start_date: string;
  end_date: string;
  used_days: number;
  reason: string;
}

interface VacationInitBody {
  vacation_available: number;
}

interface VacationSummaryResponse {
  success: boolean;
  message?: string;
  data?: VacationSummary;
  code?: string;
}

interface VacationResponse {
  success: boolean;
  message?: string;
  data?: any;
  code?: string;
}

export class VacationController {
  constructor(private readonly service: VacationService) {
  }

  /**
   * 현재 사용자의 연차 총합/사용/잔여 조회
   * GET /api/vacation/summary
   */
  getVacationSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.user?.id);
      if (!userId || userId <= 0) {
        res.status(401).json({
          success: false,
          message: '인증 정보가 없습니다.',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const summary = await this.service.getVacationSummary(userId);

      const response: VacationSummaryResponse = {
        success: true,
        message: '연차 요약 조회 완료.',
        data: summary,
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, '연차 요약 조회 중 오류가 발생했습니다.');
    }
  };

  /**
   * 현재 사용자의 기본 연차 저장/수정
   * POST /api/vacation/init
   */
  saveInitVacation = async (req: Request, res: Response): Promise<void> => {
    const uow = new UnitOfWork();

    try {
      const userId = Number(req.user?.id);
      if (!userId || userId <= 0) {
        res.status(401).json({
          success: false,
          message: '인증 정보가 없습니다.',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const {vacation_available} = req.body as VacationInitBody;
      if (typeof vacation_available !== 'number' || Number.isNaN(vacation_available) || vacation_available < 0) {
        res.status(400).json({
          success: false,
          message: '유효한 연차 값을 입력해주세요.',
          code: 'INVALID_VACATION_AVAILABLE',
        });
        return;
      }

      const vacation = {
        user_id: userId,
        vacation_year: new Date().getFullYear(),
        vacation_available,
        created_at: getCurrentDateTime(),
      };

      await uow.begin();
      await this.service.createInitVacation(uow, vacation);
      await uow.commit();

      const summary = await this.service.getVacationSummary(userId);
      const response: VacationSummaryResponse = {
        success: true,
        message: '기본 연차가 저장되었습니다.',
        data: summary,
      };
      res.status(200).json(response);
    } catch (error) {
      if (uow.isTransactionActive()) {
        await uow.rollback();
      }

      this.handleError(error, res, '기본 연차 저장 중 오류가 발생했습니다.');
    }
  };

  /**
   * 남은 연차 조회
   * GET /api/vacation/remaining
   */
  getRemainingVacation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.user?.id);
      if (!userId || userId <= 0) {
        res.status(401).json({
          success: false,
          message: '인증 정보가 없습니다.',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const remaining = await this.service.getRemainingVacation(userId);

      const response: VacationResponse = {
        success: true,
        message: '남은 연차 조회 완료.',
        data: { remaining },
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, '남은 연차 조회 중 오류가 발생했습니다.');
    }
  };

  /**
   * 휴가 신청
   * POST /api/vacation/request
   */
  requestVacation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.user?.id);
      if (!userId || userId <= 0) {
        res.status(401).json({
          success: false,
          message: '인증 정보가 없습니다.',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const {start_date, end_date, used_days, reason} = req.body as VacationRequestBody;

      // 입력 검증
      if (!start_date || !end_date || !used_days || !reason) {
        res.status(400).json({
          success: false,
          message: '필수 필드를 입력해주세요.',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      const normalizedStartDate = setDateTime(start_date);
      const normalizedEndDate = setDateTime(end_date);

      if (
        !/^\d{12}$/.test(normalizedStartDate) ||
        !/^\d{12}$/.test(normalizedEndDate)
      ) {
        res.status(400).json({
          success: false,
          message: '유효한 날짜/시간 형식을 입력해주세요.',
          code: 'INVALID_DATE_FORMAT',
        });
        return;
      }

      if (normalizedEndDate < normalizedStartDate) {
        res.status(400).json({
          success: false,
          message: '종료일시는 시작일시보다 빠를 수 없습니다.',
          code: 'INVALID_DATE_RANGE',
        });
        return;
      }

      if (typeof used_days !== 'number' || used_days <= 0) {
        res.status(400).json({
          success: false,
          message: '사용 일수는 0보다 커야 합니다.',
          code: 'INVALID_USED_DAYS',
        });
        return;
      }

      const requestId = await this.service.requestVacation({
        user_id: userId,
        start_date: normalizedStartDate,
        end_date: normalizedEndDate,
        used_days,
        reason,
        created_at: getCurrentDateTime(),
      });

      const response: VacationResponse = {
        success: true,
        message: '휴가 신청이 완료되었습니다.',
        data: {id: requestId},
      };
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res, '휴가 신청 중 오류가 발생했습니다.');
    }
  };

  /**
   * 사용자의 휴가 신청 내역 조회
   * GET /api/vacation/requests
   */
  getUserRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.user?.id);
      if (!userId || userId <= 0) {
        res.status(401).json({
          success: false,
          message: '인증 정보가 없습니다.',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const requests = await this.service.getUserRequests(userId);
      const response: VacationResponse = {
        success: true,
        message: '휴가 신청 내역 조회 완료.',
        data: requests,
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, '휴가 신청 내역 조회 중 오류가 발생했습니다.');
    }
  };

  /**
   * 휴가 신청 취소
   * DELETE /api/vacation/requests/:id
   */
  deleteRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.user?.id);
      if (!userId || userId <= 0) {
        res.status(401).json({
          success: false,
          message: '인증 정보가 없습니다.',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const requestId = Number(req.params.id);
      if (!requestId || requestId <= 0) {
        res.status(400).json({
          success: false,
          message: '유효한 신청 ID가 아닙니다.',
          code: 'INVALID_REQUEST_ID',
        });
        return;
      }

      await this.service.deleteRequest(requestId, userId);

      const response: VacationResponse = {
        success: true,
        message: '휴가 신청이 취소되었습니다.',
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, '휴가 신청 취소 중 오류가 발생했습니다.');
    }
  };

  private handleError(error: unknown, res: Response, fallbackMessage: string): void {
    if (error instanceof AppError) {
      const response: VacationResponse = {
        success: false,
        message: error.message,
        code: error.code,
      };
      res.status(error.statusCode).json(response);
      return;
    }

    const message = error instanceof Error && error.message ? error.message : fallbackMessage;
    const response: VacationResponse = {
      success: false,
      message,
      code: 'INTERNAL_SERVER_ERROR',
    };
    res.status(500).json(response);
  }
}
